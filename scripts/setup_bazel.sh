#!/usr/bin/env bash
set -ueo pipefail

# Symlink fetched bazelisk to /usr/local/bin/bazel
pathToBazel=$(realpath ./node_modules/@bazel/bazelisk/bazelisk-linux_amd64)
sudo ln -fs $pathToBazel /usr/local/bin/bazel
echo "Bazel version:"
bazel version
