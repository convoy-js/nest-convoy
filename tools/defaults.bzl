load("@npm//@bazel/typescript:index.bzl", "ts_library")

def nest_module(deps = [], **kwargs):
    deps = [
        "@npm//@nestjs/common",
        "@npm//@types/node",
        "@npm//tslib",
    ] + deps

    ts_library(
        tsconfig = "//:tsconfig.json",
        supports_workers = True,
        deps = deps,
        **kwargs
    )
