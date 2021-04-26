#!/bin/sh

set -e

cd `dirname $0`/..

mkdir -p target

prefix=`cat VERSION_PREFIX`
suffix=`build/revision`
version=$prefix.$suffix
prelude=`bin/prelude`
preludenl=$prelude.$'\n'

java -jar deps/closure-compiler/compiler.jar -O SIMPLE --formatting PRETTY_PRINT \
--language_out=ECMASCRIPT_2020 \
--generate_exports --output_wrapper "$preludenl%output%" -D TRANSIT_NODE_TARGET=true \
--dependency_mode=PRUNE --entry_point=com.cognitect.transit \
--js_output_file=target/transit.js \
'deps/closure-library/closure/**.js' 'src/**.js'
