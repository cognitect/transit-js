# transit-js

## Usage

Install the project dependencies with the following command from the
repo directory:

```
npm install
```

Test

```
grunt nodeunit
```

## Build

### Version

The build version is automatically incremented.  To determine the
current build version:

    build/version

### Package

Packaging builds the npm artifacts in `target/package` and installs
it into the local npm repository.  To package:

    build/package

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
