# mysite dev container image.
#
# We use a Dockerfile (not a bare `image:`) to install system tools and seed
# named-volume ownership. The devcontainer mounts a named volume at
# /home/node/.vscode-server to persist extensions and
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

# Optional host package-source overrides supplied by devcontainer.json. Features
# are installed in a later generated stage and inherit these environment values.
ARG NPM_CONFIG_REGISTRY
ARG PIP_INDEX_URL
ENV NPM_CONFIG_REGISTRY=${NPM_CONFIG_REGISTRY} \
    PIP_INDEX_URL=${PIP_INDEX_URL}

# Baseline CLI tools belong in the image; post-create runs later as the remote user.
# Chromium renders LinkedIn carousel PDFs; Poppler verifies their pages, geometry, and text.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        bat \
        chromium \
        dnsutils \
        fd-find \
        iputils-ping \
        jq \
        netcat-openbsd \
        poppler-utils \
        ripgrep \
        tree \
        unzip \
        zip \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/fdfind /usr/local/bin/fd \
    && ln -sf /usr/bin/batcat /usr/local/bin/bat \
    && mkdir -p /.devcontainercache /home/node/.vscode-server \
    && chown node:node /.devcontainercache /home/node/.vscode-server
