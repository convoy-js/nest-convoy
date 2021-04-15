#!/usr/bin/env bash
set -ueo pipefail

# Symlink fetched bazelisk to /usr/local/bin/bazel
pathToBazel=$(yarn bin)/bazelisk
sudo ln -fs $pathToBazel /usr/local/bin/bazel
echo "Bazel version:"
bazel version
