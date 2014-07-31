#!/bin/bash

set -e

echo -e "Building docs\n"
rm -rf docs
bin/docs
echo -e "Built docs at docs/\n"

echo -e "Checking out gh-pages branch\n"
rm -rf gh-pages
git clone --quiet --branch=gh-pages git@github.com:cognitect/transit-js.git gh-pages > /dev/null
cd gh-pages

echo -e "Replacing old gh-pages content with new docs\n"
git rm -rf ./*
cp -Rf ../docs/* ./
git add -f .
git commit -m "Updating gh-pages with new api docs"
git push -fq origin gh-pages > /dev/null
cd ..

echo -e "Cleaning up\n"
rm -rf gh-pages