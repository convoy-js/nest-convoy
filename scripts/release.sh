#!/usr/bin/env bash
set -u -e -o pipefail

# Call the script with argument "pack" or "publish"
readonly NPM_COMMAND=${1:-publish}
# Don't rely on $PATH to have the right version
readonly BAZEL_BIN=$(yarn bin)/bazelisk
# Build into a distinct output location so that artifacts from previous builds are not reused
readonly BAZEL_OUTPUT_BASE=$(mktemp -d -t nest-convoy-latest.XXXXXXX)
readonly BAZEL="$BAZEL_BIN --output_base=$BAZEL_OUTPUT_BASE"
# Find all the npm packages in the repo
readonly PKG_NPM_LABELS=`$BAZEL query --output=label 'kind("pkg_npm", //...)'`
# Build them in one command to maximize parallelism
$BAZEL build --config=release $PKG_NPM_LABELS
# publish one package at a time to make it easier to spot any errors or warnings
for pkg in $PKG_NPM_LABELS ; do
  $BAZEL run --config=release -- ${pkg}.${NPM_COMMAND} --access public --tag latest
done
