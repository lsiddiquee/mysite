# mysite dev container image.
#
# We use a Dockerfile (not a bare `image:`) for ONE reason: the devcontainer
# mounts a named volume at /home/node/.vscode-server to persist extensions and
# per-workspace storage across rebuilds. A fresh named volume is created
# root-owned, and VS Code installs its server there (as user `node`) BEFORE any
# lifecycle script runs — so it fails with "Permission denied" unless the mount
# point is already node-owned.
#
# Docker copies the image directory's ownership into an empty named volume on
# first mount, so pre-creating this dir as `node` makes the volume node-owned
# and writable from the start. (post-create.sh still re-asserts ownership on
# rebuilds, but this is what makes the FIRST create work.)
FROM mcr.microsoft.com/devcontainers/typescript-node:24-bookworm

RUN mkdir -p /home/node/.vscode-server \
    && chown node:node /home/node/.vscode-server
