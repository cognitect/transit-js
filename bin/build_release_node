#!/bin/sh

set -e

cd `dirname $0`/..

mkdir -p target

prefix=`cat VERSION_PREFIX`
suffix=`build/revision`
version=$prefix.$suffix
prelude=`bin/prelude`
preludenl=$prelude.$'\n'

java -jar deps/closure-compiler/compiler.jar -O ADVANCED --generate_exports \
--output_wrapper "$preludenl%output%" -D TRANSIT_NODE_TARGET=true \
-D TRANSIT_DEV=false --externs resources/node_externs.js \
--dependency_mode=PRUNE --entry_point=com.cognitect.transit \
--js_output_file=target/transit.js \
'deps/closure-library/closure/**.js' 'src/**.js'
