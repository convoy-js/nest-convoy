workspace(
    # This should be the exact same as in package.json
    name = "nest_convoy",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Fetch rules_nodejs so we can install our npm dependencies
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "6142e9586162b179fdd570a55e50d1332e7d9c030efd853453438d607569721d",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/3.0.0/rules_nodejs-3.0.0.tar.gz"],
)

# Setup the Node.js toolchain
load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "yarn_install")

node_repositories(
    node_version = "14.15.0",
    yarn_version = "1.22.4",
)

yarn_install(
    name = "npm",
    data = [
        "//:patches/@bazel+typescript+2.0.3.patch",
        "//:patches/jest-haste-map+26.1.0.patch",
    ],
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)

####################################################
# Support creating Docker images for our node apps #
####################################################
#http_archive(
#    name = "io_bazel_rules_docker",
#    sha256 = "c15ef66698f5d2122a3e875c327d9ecd34a231a9dc4753b9500e70518464cc21",
#    strip_prefix = "rules_docker-7da0de3d094aae5601c45ae0855b64fb2771cd72",
#    urls = ["https://github.com/bazelbuild/rules_docker/archive/7da0de3d094aae5601c45ae0855b64fb2771cd72.tar.gz"],
#)

#load(
#    "@io_bazel_rules_docker//repositories:repositories.bzl",
#    container_repositories = "repositories",
#)

#container_repositories()

#load(
#    "@io_bazel_rules_docker//nodejs:image.bzl",
#    nodejs_image_repos = "repositories",
#)

#nodejs_image_repos()

#load(
#    "@io_bazel_rules_docker//nodejs:image.bzl",
#    nodejs_image_repos = "repositories",
#)

#nodejs_image_repos()
