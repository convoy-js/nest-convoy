load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary", _pkg_npm = "pkg_npm")
load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("//tools:eslint.bzl", "eslint_test")
load("//tools:jest.bzl", "jest_test")

def pkg_npm(substitutions = {}, **kwargs):
    _pkg_npm(
        substitutions = dict({
            "0.0.0-PLACEHOLDER": "{BUILD_SCM_VERSION}",
        }, **substitutions),
        **kwargs
    )

def eslint(tags = ["lint"], **kwargs):
    eslint_test(
        config = "//:.eslintrc.js",
        deps = [
            "@npm//eslint-plugin-import",
            "@npm//@typescript-eslint/eslint-plugin",
            "@npm//@typescript-eslint/parser",
            "@npm//eslint-config-prettier",
            "@npm//eslint-plugin-prettier",
            "//:tsconfig.json",
            "//:.prettierrc.json",
        ],
        tags = tags,
        **kwargs
    )

def nest_library(name, srcs, deps = [], visibility = ["//:__subpackages__"], **kwargs):
    deps = [
        "@npm//reflect-metadata",
        "@npm//@nestjs/common",
        "@npm//@types/node",
        "@npm//tslib",
    ] + deps

    eslint(
        name = "%s.lint" % name,
        srcs = srcs,
    )

    ts_library(
        name = name,
        supports_workers = True,
        deps = deps,
        srcs = srcs,
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

def nest_app(name, entry, deps = []):
    nest_library(
        name = "%s_lib" % name,
        srcs = [entry],
        deps = ["@npm//@nestjs/platform-express", "@npm//@nestjs/core"] + deps,
    )

    nodejs_binary(
        name = name,
        data = ["%s_lib" % name],
        templated_args = ["--bazel_patch_module_resolver"],
        entry_point = entry,
    )
