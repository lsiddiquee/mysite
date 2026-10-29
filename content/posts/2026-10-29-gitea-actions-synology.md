---
title: Fixing Gitea Actions on Synology Container Manager
date: 2026-10-29
summary: Fix a Gitea Actions runner failing before checkout on Synology by replacing Docker-in-Docker with the host Docker socket, with the security tradeoff explained.
hero: assets/gitea-actions-synology-hero.jpg
tags:
  - docker
  - troubleshooting
  - security
  - gitea
  - synology
---

Gitea worked on my Synology NAS. Its CI jobs failed before they could check out a single file.

I was hosting Gitea and its Actions runner through **Synology Container Manager's Docker Compose support**. The server was running, but the runner could not create the container that would execute the workflow. None of the repository's code had run yet.

The fix was to stop running a second Docker daemon inside the runner and use Synology's existing daemon instead. That removed the failing nested mount. It also gave CI access to the same daemon managing the other containers on my NAS. Those are two consequences of the same change.

## The Original Compose Configuration

This was the starting configuration. The server had its own persistent data directory, and the runner had both a registration directory and a volume for its inner Docker daemon. The registration token below is a placeholder, not a real credential.

```yaml
version: "3.8"

networks:
  gitea:
    driver: bridge

services:
  server:
    image: docker.gitea.com/gitea:28.2.0
    container_name: gitea
    restart: always
    environment:
      GITEA_APP_INI: /data/gitea/conf/app.ini
      USER_UID: "1026"
      USER_GID: "100"
      TZ: Europe/Amsterdam
    networks:
      - gitea
    volumes:
      - /volume1/docker/gitea/data:/data
    ports:
      - "3000:3000"
      - "2222:2222"

  runner:
    image: docker.io/gitea/runner:5-dind
    container_name: gitea_runner
    restart: always
    privileged: true
    environment:
      GITEA_INSTANCE_URL: http://server:3000
      GITEA_RUNNER_REGISTRATION_TOKEN: "REPLACE_WITH_YOUR_REGISTRATION_TOKEN"
    depends_on:
      - server
    networks:
      - gitea
    volumes:
      - /volume1/docker/gitea/runner:/data
      - runner-docker:/var/lib/docker

volumes:
  runner-docker:
```

The `5-dind` suffix matters here: that image runs a second Docker daemon inside the runner container. When a workflow needs a job container, the inner daemon creates it. In this setup, that extra Docker layer was where execution stopped.

## Why CI Failed

I inspected the failed runs with the logged-in `tea` CLI:

```bash
tea actions runs logs 3
```

Both runs I inspected failed at the same boundary: creating the job container. There was no dependency problem or failing test to investigate yet. Checkout, installation, linting, builds, and tests had never started.

The decisive error was:

```text
failed to create container:
failed to mount ... fstype: overlay ... err: no such device
```

The inner Docker daemon was using containerd's OverlayFS snapshotter. It tried to mount the job container's filesystem, and that nested mount failed with `no such device`.

The runner already had `privileged: true`. There was no missing privileged-mode switch to turn on, and privileges cannot supply a capability the host kernel lacks. The logs located the failure at the nested mount; they did not establish the exact Synology kernel limitation. I had enough evidence to change the Docker arrangement, not enough to name a specific kernel defect.

## Using Synology's Docker Daemon Instead

I replaced `gitea/runner:5-dind` with **`gitea/runner:5`**, the basic runner image, and mounted Synology's Docker socket. Instead of asking an inner daemon to create job containers, the runner would ask the daemon already running on the NAS.

That removed the nested daemon and its filesystem mount from the execution path. It did not require a change to the Gitea server.

The changes were:

- Switch the runner image to `docker.io/gitea/runner:5`.
- Mount `docker.sock`.
- Remove `privileged: true`.
- Remove the inner `/var/lib/docker` volume mount.
- Preserve the existing runner registration directory.

**Security trade-off:** removing `privileged: true` does not make this a low-authority runner. Docker socket access gives it extensive control over the NAS, including other containers. A workflow with that access is operating inside the NAS's trust boundary. Use this setup only for trusted repositories and workflows; a dedicated Linux VM provides stronger isolation from the NAS.

I covered a related placement decision in [Deploying the gateway: containers, WSL, and your LAN](https://www.likhansiddiquee.com/blog/secured-deployment/): deciding where a service runs also means deciding what it can reach. Here, the Docker socket is the access that needs scrutiny.

## Troubleshooting the Replacement

Changing the Docker arrangement removed one problem, but the replacement still needed a configuration file and the right network. A stale Container Manager entry added a separate distraction.

All commands below run through SSH **on the Synology NAS**, not on a development workstation.

### Docker Socket Permissions

The first obstacle was inspecting Docker itself. My SSH user received:

```text
permission denied while trying to connect to the Docker daemon socket
```

Using `sudo` let me inspect the containers and runner logs:

```bash
sudo docker ps -a --filter name=gitea_runner
sudo docker logs --tail 100 gitea_runner
```

This was a permission error from my SSH user's Docker command. Using `sudo` was enough for that inspection; there was no need to make the Docker socket world-writable.

### Missing Runner Configuration

The replacement runner then reported:

```text
open config file "/data/config.yaml": no such file or directory
```

The Compose configuration pointed to a file I had not created. The bind mount made the NAS's runner directory appear as `/data` inside the container, so `/data/config.yaml` needed a corresponding file on the NAS:

```text
/volume1/docker/gitea/runner/config.yaml
```

### The Actual Docker Network Name

After creating the file, the next error was:

```text
network gitea not found
```

I had used the Compose network key, `gitea`, as though it were the Docker network's name. The project was also named `gitea`, so Compose had created `gitea_gitea`. The runner was looking for a network that did not exist under the name I supplied.

I confirmed it with:

```bash
sudo docker inspect gitea \
  --format '{{range $name, $network := .NetworkSettings.Networks}}{{println $name}}{{end}}'
```

The runner's `container.network` setting needs the **actual Docker network name**, not the key in the Compose file. Putting the job containers on that network lets them reach Gitea at `http://server:3000`. The complete configuration below makes the name explicit so the two files agree.

### Synology's Stale Container Entry

Meanwhile, Container Manager displayed an old prefixed runner name. Opening it returned "No such container", which made the state look worse than Docker's own output showed.

Docker showed the current containers correctly:

```text
gitea_runner          gitea/runner:5
gitea                 docker.gitea.com/gitea:28.2.0
GITEA-ACTIONS-TASK-... docker.gitea.com/runner-images:ubuntu-latest
```

The long Actions name was a temporary job container, not another runner to clean up. Docker showed the current runner and server, plus the container doing the work. The stale DSM entry was a separate UI problem, not a reason to recreate a working runner.

## Complete Working Configuration

This is the complete replacement Compose YAML, with the nested daemon removed and the network explicitly named `gitea_gitea`. The runner configuration below uses that same name.

Adjust the NAS paths, UID, GID, and ports for your installation. The Gitea server image is unchanged from the original setup; this fix does not require a server upgrade.

```yaml
version: "3.8"

networks:
  gitea:
    name: gitea_gitea
    driver: bridge

services:
  server:
    image: docker.gitea.com/gitea:28.2.0
    container_name: gitea
    restart: always
    environment:
      GITEA_APP_INI: /data/gitea/conf/app.ini
      USER_UID: "1026"
      USER_GID: "100"
      TZ: Europe/Amsterdam
    networks:
      - gitea
    volumes:
      - /volume1/docker/gitea/data:/data
    ports:
      - "3000:3000"
      - "2222:2222"

  runner:
    image: docker.io/gitea/runner:5
    container_name: gitea_runner
    restart: always
    depends_on:
      - server
    environment:
      GITEA_INSTANCE_URL: http://server:3000
      GITEA_RUNNER_REGISTRATION_TOKEN: "REPLACE_WITH_YOUR_REGISTRATION_TOKEN"
      CONFIG_FILE: /data/config.yaml
      DOCKER_HOST: unix:///var/run/docker.sock
      TZ: Europe/Amsterdam
    networks:
      - gitea
    volumes:
      - /volume1/docker/gitea/runner:/data
      - /var/run/docker.sock:/var/run/docker.sock
```

Before deploying, create `/volume1/docker/gitea/runner/config.yaml` with:

```yaml
container:
  network: gitea_gitea
```

For a new installation, obtain a runner registration token from the appropriate Gitea Actions settings and replace the placeholder. **After successful registration, remove the token environment variable from Compose.** The persisted `.runner` file retains the runner's registration credentials.

For an existing installation, keep the `.runner` file and the rest of the runner directory. Changing how the runner reaches Docker is not a reason to discard its registration. Do not delete the server data or the old Docker volume during troubleshooting. Rotate any registration token accidentally shared in screenshots, logs, or messages.

## Deploying and Verifying

Apply the changes by updating and redeploying the existing project through Synology Container Manager. A restart is not enough: changing the image and mounts requires the runner container to be recreated from the updated Compose configuration.

Inspect the runner:

```bash
sudo docker logs --since 2m --tail 50 gitea_runner
```

Once it reports successful startup, rerun the failed workflow. Do not restart the runner while a job is active, because that can cancel the job.

In this case, registration succeeded, a job container appeared on Synology's Docker daemon, and CI began progressing. That was the evidence I needed for this fix: the runner had crossed the container-creation boundary where both inspected runs had stopped.

It was not proof of a green pipeline. Whether every build and test passes is a separate check. The original failure happened before the repository could run; now its workflow could start. The remaining decision is whether giving those workflows access to the NAS's Docker daemon is an acceptable place to run them.

Would you let trusted CI workflows share your NAS's Docker daemon, or move the runner into a dedicated VM? Which repository trust boundary or isolation requirement would change your choice?
