#!/bin/bash

set -e

echo "Cleaning..."
rm -rf ./target

echo "Calculating version..."
prefix=`cat VERSION_PREFIX`
suffix=`build/revision`
version=$prefix.$suffix
echo $version

echo "Packaging..."
bin/build_jar
mvn versions:set -DnewVersion=${version}
mvn install:install-file -Dfile=./target/transit.jar -DpomFile=pom.xml -DcreateChecksum=true -DlocalRepositoryPath=./target/package
mvn versions:revert

echo "Package done!"
