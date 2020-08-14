#!/usr/bin/env bash
set -u -e -o pipefail

# Symlink fetched bazelisk to /usr/local/bin/bazel
pathToBazel=$(realpath ./node_modules/@bazel/bazelisk/bazelisk-linux_amd64)
sudo ln -fs $pathToBazel /usr/local/bin/bazel
echo "Bazel version:"
bazel version
