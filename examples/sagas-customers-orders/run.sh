#!/bin/sh
bazel run //examples/sagas-customers-orders/orders
bazel run //examples/sagas-customers-orders/customers

docker-compose up -d
