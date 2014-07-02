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

## License

Copyright © 2014 Cognitect, Inc.

Distributed under the Eclipse Public License either version 1.0 or (at
your option) any later version.
