# transit-js

Transit is a data format and a set of libraries for conveying values between applications written in different languages. This library provides support for marshalling Transit data to/from JavaScript.

* [Rationale](http://i-should-be-a-link)
* [API docs](http://cognitect.github.io/transit-java/)
* [Specification](http://github.com/cognitect/transit-format)

## Releases and Dependency Information

* Latest release: TBD
* [All Released Versions](http://search.maven.org/#search%7Cgav%7C1%7Cg%3A%22com.cognitect%22%20AND%20a%3A%22transit-cljs%22)

### JavaScript

You can include either the development or release build of transit-js in
your webpage.

### Node.js

transit-js is released to [npm](https://www.npmjs.org). Add transit-js to your `package.json` dependencies.

### Bower

### Maven

[Maven](http://maven.apache.org/) dependency information:

```xml
<dependency>
  <groupId>com.cognitect</groupId>
  <artifactId>transit-js</artifactId>
  <version>TBD</version>
</dependency>
```

## Usage

From the browser transit-js is available at the top level:

```javascript
var t = transit;

function roundtrip(x) {
  var r = t.reader("json"),
      w = t.writer("json"),
  return t.read(r, t.write(w, x));
}

function testRoundtrip() {
  var arr1 = ["red", "green", "blue"],
      arr2 = ["apple", "pear", "grape"]
      data = t.map();
  data.set(t.integer(1), list1);
  data.set(t.integer(2), list2);
  return t.equals(data, roundtrip(data));
}
```

From Node.js you must require transit-js:

```javascript
var t = require("transit");

function roundtrip(x) {
  var r = t.reader("json"),
      w = t.writer("json"),
  return t.read(r, t.write(w, x));
}

function testRoundtrip() {
  var arr1 = ["red", "green", "blue"],
      arr2 = ["apple", "pear", "grape"]
      data = t.map();
  data.set(t.integer(1), list1);
  data.set(t.integer(2), list2);
  return t.equals(data, roundtrip(data));
}
```

## Contributing 

Please discuss potential problems or enhancements on the [transit-format mailing list](https://groups.google.com/forum/#!forum/transit-format). Issues should be filed using GitHub issues for this project.

Contributing to Cognitect projects requires a signed [Cognitect Contributor Agreement](http://cognitect.com/contributing).

## Development

### Dependencies

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

### Running the tests

```
bin/test
```

In order to run the `bin/verify` tests from
[transit-clj](http://github.com/cognitect/transit-clj), you must first
build the production Node.js build:

```
bin/build_release_node
```

### Build

#### Version

The build version is automatically incremented.  To determine the
current build version:

```
build/revision
```

#### Build for Node.js

```
bin/build_release_node
```

#### Build for Browser

```
bin/build_release_browser
```

#### Building the documentaiton

```
bin/docs
```

#### Build JAR for ClojureScript

The following will install a JAR suitable for use from ClojureScript
into your local Maven repository.

```
build/package
```

#### Deploy

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
