#!/bin/sh

set -e

cd `dirname $0`/..

bin/make_deps_js
bin/build_dev_node
node_modules/.bin/grunt nodeunit
