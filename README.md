# transit-js

## Dependencies

Install the project's Node development dependencies with the following
command from the repo directory:

```
npm install
```

Install the Google Closure compiler.jar in a convenient location and
set the $CLOSURE_COMPILER_HOME shell environment variable. Checkout
the Google Closure Library and set the $CLOSURE_HOME environment
variable.

In order to build transit-js for ClojureScript, Maven must be installed.

## Running the tests

Assuming all dependencies have been installed and
$CLOSURE_COMPILER_HOME and $CLOSURE_HOME have been set:

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
