#!/bin/sh

set -e

cd `dirname $0`/..

mkdir -p target

prefix=`cat VERSION_PREFIX`
suffix=`build/revision`
version=$prefix.$suffix
prelude=`bin/prelude`
preludenl=$prelude.$'\n'

java -jar deps/closure-compiler/compiler.jar -O ADVANCED \
--output_wrapper "$preludenl;(function(){%output%})();" --generate_exports \
-D TRANSIT_BROWSER_TARGET=true -D TRANSIT_DEV=false --externs resources/externs.js \
--dependency_mode=PRUNE --entry_point=com.cognitect.transit \
--js_output_file=target/transit-$version-min.js \
'deps/closure-library/closure/**.js' 'src/**.js'
