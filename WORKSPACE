workspace(
    # This should be the exact same as in package.json
    name = "nest_convoy",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Fetch rules_nodejs so we can install our npm dependencies
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "10f534e1c80f795cffe1f2822becd4897754d18564612510c59b3c73544ae7c6",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/3.5.0/rules_nodejs-3.5.0.tar.gz"],
)

# Setup the Node.js toolchain
load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "yarn_install")

node_repositories(
    # We cannot use AggregateError since rules_nodejs doesn't support 15+
    node_version = "14.15.3",
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
