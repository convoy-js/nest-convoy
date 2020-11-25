#!/usr/bin/env bash
set -ueo pipefail

bazelrc_conf="$1"
bazelrc_user="$2"
git_branch="$3"

cp ${bazelrc_conf} ${bazelrc_user}

echo 'build --remote_accept_cached=true' >> ${bazelrc_user}
echo "Reading from remote cache for bazel remote jobs."
if [[ $git_branch == "dev" || $git_branch == "master" ]]; then
  echo 'build --remote_upload_local_results=true' >> ${bazelrc_user}
  echo "Uploading local build results to remote cache."
else
  echo 'build --remote_upload_local_results=false' >> ${bazelrc_user}
  echo "Not uploading local build results to remote cache."
fi

if [[ -n "$BUILD_BUDDY_TOKEN" ]]; then
  {
    eval echo 'build --bes_results_url=https://app.buildbuddy.io/invocation/'
    eval echo 'build --bes_backend=grpcs://$BUILD_BUDDY_TOKEN@cloud.buildbuddy.io'
    eval echo 'build --remote_cache=grpcs://$BUILD_BUDDY_TOKEN@cloud.buildbuddy.io'
    #eval echo 'build --remote_executor=grpcs://$BUILD_BUDDY_TOKEN@cloud.buildbuddy.io'
  } >> ${bazelrc_user}

  echo "Using Build Buddy."
fi
