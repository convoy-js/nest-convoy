workspace(
    # This should be the exact same as in package.json
    name = "nest_convoy",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Fetch rules_nodejs so we can install our npm dependencies
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "10fffa29f687aa4d8eb6dfe8731ab5beb63811ab00981fc84a93899641fd4af1",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/2.0.3/rules_nodejs-2.0.3.tar.gz"],
)

# Setup the Node.js toolchain
load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")

yarn_install(
    name = "npm",
    data = [
        "//:patches/@bazel+typescript+2.0.0.patch",
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
#    sha256 = "4521794f0fba2e20f3bf15846ab5e01d5332e587e9ce81629c7f96c793bb7036",
#    strip_prefix = "rules_docker-0.14.4",
#    urls = ["https://github.com/bazelbuild/rules_docker/releases/download/v0.14.4/rules_docker-v0.14.4.tar.gz"],
#)

#load(
#    "@io_bazel_rules_docker//repositories:repositories.bzl",
#    container_repositories = "repositories",
#)
#container_repositories()

#load("@io_bazel_rules_docker//repositories:deps.bzl", container_deps = "deps")

#container_deps()

#load("@io_bazel_rules_docker//repositories:pip_repositories.bzl", "pip_deps")

#pip_deps()

#load(
#    "@io_bazel_rules_docker//nodejs:image.bzl",
#    nodejs_image_repos = "repositories",
#)

#nodejs_image_repos()
