load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("//tools:jest.bzl", "jest_test")

def nest_library(deps = [], visibility = ["//:__subpackages__"], **kwargs):
    deps = [
        "@npm//@nestjs/common",
        "@npm//@types/node",
        "@npm//tslib",
    ] + deps

    ts_library(
        supports_workers = True,
        deps = deps,
        visibility = visibility,
        **kwargs
    )

def nest_test(name, srcs, deps = [], tags = ["unit"]):
    deps = [
        "@npm//@types/jest",
        "@npm//@nestjs/testing",
    ] + deps

    nest_library(
        name = "%s_lib" % name,
        visibility = ["//visibility:private"],
        srcs = srcs,
        deps = deps,
        tags = tags,
    )

    jest_test(
        name = name,
        srcs = ["%s_lib" % name],
        deps = deps,
        tags = tags,
    )
