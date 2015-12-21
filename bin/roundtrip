#!/bin/sh

set -e

cd `dirname $0`/..

bin/build_release_node
exec bin/read_write.js "$@"
