#!/bin/bash

set -e

bucket=datomic-maven

./build/package

echo "Deploying"

aws s3 cp --recursive ./target/package s3://${bucket}/releases

echo "Deploy done!"
