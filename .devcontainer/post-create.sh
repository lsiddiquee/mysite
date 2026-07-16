#!/usr/bin/env bash
#
# mysite dev container post-create setup.
#
# Invoked by .devcontainer/devcontainer.json:
#     "postCreateCommand": "bash .devcontainer/post-create.sh"
#
# Philosophy: FAIL LOUD. Every step below is required; if any step fails, the
# whole post-create fails so the problem is visible instead of silently skipped.
# We use `set -euo pipefail` and do NOT wrap steps in `|| true` or silent skips.
# Steps are still idempotent, so rebuilds stay clean. Genuine conditionals
# (e.g. `if [ -d dir ]`) are branching, not error-hiding, and are allowed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

CACHE_DIR="/.devcontainercache"

echo "==> mysite post-create: starting (repo root: ${REPO_ROOT})"

# 1. Persisted cache directory ----------------------------------------------
# The named volume is created as root; make it writable by the remote user.
echo "==> cache: ensuring ${CACHE_DIR} is owned by $(whoami)"
sudo mkdir -p "${CACHE_DIR}/npm-cache" "${CACHE_DIR}/pre-commit"
sudo chown -R "$(whoami)":"$(whoami)" "${CACHE_DIR}"

# The vscode-server volume is also root-owned on first create; hand it to the user
# so extensions and workspace storage can be written.
if [ -d "${HOME}/.vscode-server" ]; then
  echo "==> vscode-server: ensuring ${HOME}/.vscode-server is owned by $(whoami)"
  sudo chown -R "$(whoami)":"$(whoami)" "${HOME}/.vscode-server"
fi

# 2. Git configuration -------------------------------------------------------
echo "==> git: safe.directory + editor"
git config --global --add safe.directory "${REPO_ROOT}"
git config --global core.editor "code --wait"

# 3. Install app dependencies ------------------------------------------------
echo "==> deps: npm install (app/)"
(cd app && npm install)

# 4. pre-commit framework + git hooks ----------------------------------------
# Repo-wide hook manager. Install it (pipx preferred, pip --user fallback),
# verify it is on PATH, then register the pre-commit + commit-msg hooks. A
# missing/failed install fails the build — it is never silently skipped.
if ! command -v pre-commit >/dev/null 2>&1; then
  echo "==> pre-commit: installing framework"
  if command -v pipx >/dev/null 2>&1; then
    pipx install pre-commit
  else
    pip install --user pre-commit
    export PATH="${HOME}/.local/bin:${PATH}"
  fi
fi
if ! command -v pre-commit >/dev/null 2>&1; then
  echo "ERROR: pre-commit is not on PATH after install" >&2
  exit 1
fi
echo "==> pre-commit: installing pre-commit + commit-msg hooks"
pre-commit install --install-hooks --hook-type pre-commit --hook-type commit-msg

echo "==> mysite post-create: complete."
