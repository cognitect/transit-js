# transit-js

Transit is a data format and a set of libraries for conveying values
between applications written in different languages. This library
provides support for marshalling Transit data to/from
JavaScript. transit-js will work with any
[ECMAScript-262 Edition 3](http://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262,%203rd%20edition,%20December%201999.pdf)
or newer JavaScript implementation provided that a
[JSON](http://www.json.org) module that supplies `parse` and
`stringify` methods is present. transit-js does not currently
support encoding to [MessagePack](http://msgpack.org).

* [Rationale](http://blog.cognitect.com/blog/2014/7/22/transit)
* [Getting Started](https://github.com/cognitect/transit-js/wiki/Getting-Started), Get up and running ASAP
* [API docs](http://cognitect.github.io/transit-js/classes/transit.html)
* [Specification](http://github.com/cognitect/transit-format)
* [Take a tour!](http://cognitect.github.io/transit-tour)
* [FAQ](http://github.com/cognitect/transit-js/wiki/FAQ), for common transit-js specific questions

This implementation's major.minor version number corresponds to the version of the Transit specification it supports.

_NOTE: Transit is a work in progress and may evolve based on feedback.
As a result, while Transit is a great option for transferring data
between applications, it should not yet be used for storing data
durably over time. This recommendation will change when the
specification is complete._ 

## Releases and Dependency Information

* Latest release: 0.8.757
* [All Released Versions](http://search.maven.org/#search%7Cgav%7C1%7Cg%3A%22com.cognitect%22%20AND%20a%3A%22transit-cljs%22)

### JavaScript

You can include either the [release](http://cdn.cognitect.com/transit/transit-0.8.757-min.js) (10K gzipped) or [development](http://cdn.cognitect.com/transit/transit-0.8.757.js) build of transit-js on your webpage. We also provide [Require.js](http://requirejs.org) compatible [release](http://cdn.cognitect.com/transit/transit-0.8.757-amd-min.js) and [dev](http://cdn.cognitect.com/transit/transit-0.8.757-amd.js) builds.

### Node.js

transit-js is released to [npm](https://www.npmjs.org). Add transit-js to your `package.json` dependencies:

```javascript
{...
  "dependencies": {
    "transit-js": "0.8.757"
  }
 ...}
```

### Bower

You can also include transit-js in your `bower.json` dependencies:

```javascript
{...
  "dependencies": {
    "transit-js": "0.8.757"
  }
 ...}
```

### Maven

[Maven](http://maven.apache.org/) dependency information:

```xml
<dependency>
  <groupId>com.cognitect</groupId>
  <artifactId>transit-js</artifactId>
  <version>0.8.757</version>
</dependency>
```

## Documentation

Comprehensive documentation can be found [here](http://cognitect.github.io/transit-js/classes/transit.html).

## Overview

transit-js supports the conveyance of semantically rich and extensible
data between heterogenous software systems whose components include
JavaScript servers and clients.

#### Beyond JSON

The [Transit rationale](http://blog.cognitect.com/blog/2014/7/22/transit) covers many of the
reasons to put aside the limitations of JSON. As with the other
Transit implementations, transit-js supports conveying a larger range
of scalar and non-scalar values than permitted by JSON. Of these
types, the transit-js handling of the map representation is the most
novel from the perspective of a JavaScript applications developer.

#### Transit Maps

Transit representations of maps are decoded by transit-js
into a high performance data structure that largely mirrors the [ECMAScript Edition
6](http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts)
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
data type. Doing so allows natural indexing of data using common scalars
like 64 bit integers and dates without requiring the out of band
application logic often encountered in systems that marshal JSON.

The adaptive implementation of transit-js maps delivers performance
comparable to plain JavaScript objects and native ES6 Map
implementations.

## Usage

Please see the [Getting Started](https://github.com/cognitect/transit-js/wiki/Getting-Started) page. For an interactive guide
check out the [tour](http://cognitect.github.io/transit-tour).

From the browser transit-js is available at the top level:

```javascript
var t = transit;

function roundtrip(x) {
  var r = t.reader("json"),
      w = t.writer("json");
  return r.read(w.write(x));
}

function testRoundtrip() {
  var arr1 = ["red", "green", "blue"],
      arr2 = ["apple", "pear", "grape"],
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
      w = t.writer("json");
  return r.read(w.write(x));
}

function testRoundtrip() {
  var arr1 = ["red", "green", "blue"],
      arr2 = ["apple", "pear", "grape"],
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
|bytes|Buffer, Uint8Array, t.tagged|Buffer, Uint8Array, t.tagged|
|time|Date|Date|
|uri|t.uri|t.uri|
|uuid|t.uuid|t.uuid|
|char|String|String|
|array|Array|Array|
|set|t.set|t.set|
|map|t.map|t.map|
|link|t.link|t.link|
|cmap|t.map|t.map|

## Contributing 

This library is open source, developed internally by Cognitect. We welcome discussions of potential problems and enhancement suggestions on the [transit-format mailing list](https://groups.google.com/forum/#!forum/transit-format). Issues can be filed using GitHub [issues](https://github.com/cognitect/transit-js/issues) for this project. Because transit is incorporated into products and client projects, we prefer to do development internally and are not accepting pull requests or patches.

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
build/package_local
```

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
