#!/usr/bin/env bash
set -ueo pipefail

# Symlink fetched bazelisk to /usr/local/bin/ibazel
pathToIBazel=$(yarn bin)/ibazel
sudo ln -fs $pathToIBazel /usr/local/bin/ibazel
