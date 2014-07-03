# transit-js

## Dependencies

Building and testing transit-js requires
[Node.js](http://nodejs.org). Install the project's additional
development dependencies with the following command from the repo
directory:

```
bin/deps
```

In order to build transit-js for
[ClojureScript](http://github.com/clojure/clojurescript),
[Maven](http://maven.apache.org) must be installed.

## Running the tests

```
bin/test
```

In order to run the `bin/verify` tests from
[transit-clj](http://github.com/cognitect/transit-clj), you must first
build the production Node.js build:

```
bin/build_release_node
```

## Build

### Version

The build version is automatically incremented.  To determine the
current build version:

```
build/revision
```

### Build for Node.js

```
bin/build_release_node
```

### Build for Browser

```
bin/build_release_browser
```

### Building the documentaiton

```
bin/docs
```

### Build JAR for ClojureScript

The following will install a JAR suitable for use from ClojureScript
into your local Maven repository.

```
build/package
```

### Deploy

Deployment requires that the AWS CLI tools be installed (see
https://aws.amazon.com/cli/).

The deploy script runs the package script, and then deploys the
artifacts to the S3 bucket "mrel".  To deploy:

    build/deploy

## Copyright and License

Copyright © 2014 Cognitect

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
