# transit-js

Transit is a data format and a set of libraries for conveying values
between applications written in different languages. This library
provides support for marshalling Transit data to/from
JavaScript. transit-js will work with any
[ECMAScript-262 Edition 3](http://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262,%203rd%20edition,%20December%201999.pdf)
or newer JavaScript implementation provided that a
[JSON](http://www.json.org) module that supplies `parse` and
`stringify` methods is present.

* [Rationale](http://i-should-be-a-link)
* [API docs](http://cognitect.github.io/transit-java/)
* [Specification](http://github.com/cognitect/transit-format)
* [Take a tour!]()
* [FAQ](http://github.com/cognitect/transit-js/wiki/FAQ), for common transit-js specific questions

## Releases and Dependency Information

* Latest release: TBD
* [All Released Versions](http://search.maven.org/#search%7Cgav%7C1%7Cg%3A%22com.cognitect%22%20AND%20a%3A%22transit-cljs%22)

### JavaScript

You can include either the [development]() or [release]()(8.9K gzipped) build of transit-js in
your webpage.

### Node.js

transit-js is released to [npm](https://www.npmjs.org). Add transit-js to your `package.json` dependencies:

```javascript
{...
  "dependencies": {
    "transit-js": "TBD"
  }
 ...}
```

### Bower

You can also include transit-js in your `bower.json` dependencies:

```javascript
{...
  "dependencies": {
    "transit-js": "TBD"
  }
 ...}
```

### Maven

[Maven](http://maven.apache.org/) dependency information:

```xml
<dependency>
  <groupId>com.cognitect</groupId>
  <artifactId>transit-js</artifactId>
  <version>TBD</version>
</dependency>
```

## Overview

transit-js supports the conveyance of semantically rich and extensible
data between heterogenous software systems whose components include
JavaScript servers and clients. While the [JSON](http://json.org) data
format is convenient and reasonably efficient, the format is
semantically poor and lacks extensiblity. Many values easily
represented in other popular programming languages cannot be
represented in JSON, even common scalar values such a 64bit integers
and dates. Furthermore, the restriction that JSON object keys be
strings means that indexes naturally constructed in many programming
langugages cannot be conveyed to JavaScript.

In order to preserve value semantics between other systems and
JavaScript transit-js supports a larger range of scalar values than
JSON. In addition, to support rich indexing transit-js embraces and
extends the proposed [ECMAScript Edition
6](http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts)
specifications for
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
and
[Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

Of course better semantics at the cost of performance of is not much
of an improvement. transit-js map and set implementations offer a
performance profile that is in many cases greater than an order of
magnitude faster than existing shims. In a number of cases
transit-js maps and sets compare favorably even against native
implementations to be found in more recent builds of V8,
JavaScriptCore, and SpiderMonkey.

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
  data.set(t.integer(1), arr1);
  data.set(t.integer(2), arr2);
  return t.equals(data, roundtrip(data));
}
```

From Node.js you must require transit-js (assuming you've
included it in your project dependencies):

```javascript
var t = require("transit-js");

function roundtrip(x) {
  var r = t.reader("json"),
      w = t.writer("json"),
  return t.read(r, t.write(w, x));
}

function testRoundtrip() {
  var arr1 = ["red", "green", "blue"],
      arr2 = ["apple", "pear", "grape"]
      data = t.map();
  data.set(t.integer(1), arr1);
  data.set(t.integer(2), arr2);
  return t.equals(data, roundtrip(data));
}
```

## Default Type Mapping

Abbreviations:
* t = transit

|Transit type|Write accepts|Read returns|
|------------|-------------|------------|
|null|null|null|
|string|String|String|
|boolean|Boolean|Boolean|
|integer|Number, t.integer|Number, t.integer|
|decimal|Number|Number|
|keyword|t.keyword|t.keyword|
|symbol|t.symbol|t.symbol|
|big integer|t.bigInt|t.bigInt|
|big decimal|t.bigDec|t.bigDec|
|time|Date|Date|
|uri|t.uri|t.uri|
|uuid|t.uuid|t.uuid|
|char|String|String|
|array|Array|Array|
|set|t.set|t.set|
|map|t.map|t.map|
|link|t.link|t.link|

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

Assuming you have a
[JDK](http://www.oracle.com/technetwork/java/javaee/downloads/java-ee-sdk-6u3-jdk-7u1-downloads-523391.html)
and [Maven](http://maven.apache.org) installed, the following will
install a JAR suitable for use from ClojureScript into your local
Maven repository.

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
