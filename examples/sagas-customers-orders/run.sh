#!/bin/sh
bazel run //examples/sagas-customers-orders/orders:image
bazel run //examples/sagas-customers-orders/customers:image

docker-compose up -d
