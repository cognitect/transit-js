#!/bin/sh

set -e

cd `dirname $0`/..

rm -rf deps
rm -rf node_modules

echo "Installing Node dependencies"

npm install
npm install grunt

echo "Installing JVM dependencies"

CLOSURE_RELEASE="20210302"
mkdir -p deps/closure-compiler
cd deps/closure-compiler
echo "Fetching Google Closure compiler..."
curl --retry 3 -O -s https://repo1.maven.org/maven2/com/google/javascript/closure-compiler/v$CLOSURE_RELEASE/closure-compiler-v$CLOSURE_RELEASE.jar || { echo "Download failed."; exit 1; }
mv closure-compiler-**.jar compiler.jar
cd ../..

git clone https://github.com/google/closure-library.git deps/closure-library

mkdir -p deps/clojure
curl -O https://repo1.maven.org/maven2/org/clojure/clojure/1.6.0/clojure-1.6.0.jar
mv clojure-1.6.0.jar deps/clojure
