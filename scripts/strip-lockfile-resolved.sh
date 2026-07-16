#!/usr/bin/env bash
# =============================================================================
# strip-lockfile-resolved.sh — keep npm lockfiles registry-agnostic.
#
# The committed lockfile must pin package *versions* + *integrity* ONLY, never a
# registry-specific tarball URL. npm reconstructs the tarball path from the
# configured `registry` at install time and still verifies every package against
# its `integrity` (sha512) hash — so the lockfile works unchanged with the public
# registry in CI and the internal proxy locally, and never leaks an internal feed
# host into a public repo.
#
# This strips only registry tarball URLs (`…​.tgz`). Git / remote `resolved`
# entries (which carry an essential commit SHA or URL, not a mirror host) are
# left intact.
#
# Run as a pre-commit hook (see .pre-commit-config.yaml) or by hand:
#   scripts/strip-lockfile-resolved.sh app/package-lock.json
#
# FAIL LOUD: exits non-zero if a file is missing or the result is not valid JSON.
# =============================================================================
set -euo pipefail

for lockfile in "$@"; do
  if [[ ! -f "$lockfile" ]]; then
    echo "strip-lockfile-resolved: file not found: $lockfile" >&2
    exit 1
  fi

  tmp="$(mktemp)"
  sed -E '/^[[:space:]]*"resolved": "https?:\/\/[^"]*\.tgz",$/d' "$lockfile" >"$tmp"

  # Validate the result is still well-formed JSON before overwriting.
  python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$tmp"

  if cmp -s "$tmp" "$lockfile"; then
    rm -f "$tmp"
  else
    mv "$tmp" "$lockfile"
    echo "strip-lockfile-resolved: removed resolved tarball URLs from $lockfile — re-stage it." >&2
  fi
done
