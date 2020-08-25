load("@npm//eslint:index.bzl", _eslint_test = "eslint_test")

def eslint_test(config, srcs, deps = [], **kwargs):
    data = deps + [
        "@npm//eslint",
        config,
    ]

    templated_args = [
        "-c",
        "$(rootpath %s)" % config,
    ] + ["$(rootpaths %s)" % f for f in srcs]

    _eslint_test(
        data = [config] + srcs + deps,
        templated_args = templated_args,
        **kwargs
    )
