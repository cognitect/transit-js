// Copyright 2014 Cognitect. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

var transit = require("../target/transit.js");

function time(f, iters) {
    iters = iters || 1;
    for(var i = 0; i < iters; i++) {
        var s = new Date();
        f();
        console.log("Elapsed "+((new Date()).valueOf()-s.valueOf())+"ms");
        console.log("----------");
    }
}

console.log("1e6 iters, transit.uuid");
time(function() {
    for(var i = 0; i < 1000000; i++) {
        transit.uuid("531a379e-31bb-4ce1-8690-158dceb64be6");
    }
});

console.log("1e6 iters, transit.hash(\"foo\")");
time(function() {
    for(var i = 0; i < 1000000; i++) {
        transit.hash("foo");
    }
});

console.log("1e6 iters, transit.hash([1,2,3])");
var arr = [1,2,3];
time(function() {
    for(var i = 0; i < 1000000; i++) {
        transit.hash(arr);
    }
});

console.log("1e6 iters, transit.equals(\"foo\", \"foo\")");
time(function() {
    for(var i = 0; i < 1000000; i++) {
        transit.equals("foo", "foo");
    }
});

console.log("1e6 iters, transit.equals(\"foo\", \"bar\")");
time(function() {
    for(var i = 0; i < 1000000; i++) {
        transit.equals("foo", "bar");
    }
});

console.log("1e6 iters, transit.equals([1,2,3], [1,2,3])");
time(function() {
    var arr0 = [1,2,3],
        arr1 = [1,2,3];
    for(var i = 0; i < 1000000; i++) {
        transit.equals(arr0, arr1);
    }
});

console.log("1e6 iters, transit.equals([1,2,3], [3,2,3])");
time(function() {
    var arr0 = [1,2,3],
        arr1 = [3,2,3];
    for(var i = 0; i < 1000000; i++) {
        transit.equals(arr0, arr1);
    }
});

console.log("1e6 iters, transit.equals(transit.keyword(\"foo\"), transit.keyword(\"foo\"))");
time(function() {
    var k0 = transit.keyword("foo"),
        k1 = transit.keyword("foo");
    for(var i = 0; i < 1000000; i++) {
        transit.equals(k0, k1);
    }
});

console.log("1e6 iters, transit.equals(transit.date(1399471321791), transit.date(1399471321791))");
time(function() {
    var d0 = transit.date(1399471321791),
        d1 = transit.date(1399471321791);
    for(var i = 0; i < 1000000; i++) {
        transit.equals(d0, d1);
    }
});

console.log("1e6 iters, transit.equals(transit.keyword(\"foo\"), transit.keyword(\"bar\"))");
time(function() {
    var k0 = transit.keyword("foo"),
        k1 = transit.keyword("bar");
    for(var i = 0; i < 1000000; i++) {
        transit.equals(k0, k1);
    }
});

console.log("1e6 iters, transit.equals({foo: \"bar\"}, {foo: \"bar\"})");
time(function() {
    var obj0 = {foo: "bar"},
        obj1 = {foo: "bar"};
    for(var i = 0; i < 1000000; i++) {
        transit.equals(obj0, obj1);
    }
});

console.log("1e6 iters, TransitMap tm0.get(\"foo\")");
var tm0 = transit.map(["foo", "transit map string lookup"]);
console.log(tm0.get("foo"));
time(function() {
    for(var i = 0; i < 1000000; i++) {
        tm0.get("foo");
    }
});

console.log("1e5 iters, TransitMap tm0.get([1,2])");
var tm1 = transit.map([[1,2], "transit map array lookup"]);
console.log(tm1.get([1,2]));
time(function() {
    var key = [1,2];
    for(var i = 0; i < 100000; i++) {
        tm1.get(key);
    }
});

console.log("1e6 iters, Complex TransitSet \"bar\"");
var ts = transit.set(["foo",1,"bar",[1,2]])
console.log(ts.has("bar"));
time(function() {
    var key = "bar";
    for(var i = 0; i < 1000000; i++) {
        ts.has(key);
    }
});

console.log("1e5 iters, JSON read transit map with two keyword/string value pairs");
var json = "{\"~:foo\":\"bar\",\"~:baz\":\"woz\"}";
console.log(JSON.parse(json));
time(function() {
    for(var i = 0; i < 100000; i++) {
        JSON.parse(json);
    }
});

console.log("1e5 iters, top level read, map two keyword/string value pairs");
json = "{\"~:foo\":\"bar\",\"~:baz\":\"woz\"}";
var reader = transit.reader("json");
console.log(reader.read(json));
time(function() {
    for(var i = 0; i < 100000; i++) {
        reader.read(json)
    }
});

console.log("1e5 iters, top level JSON-M read, map with two keyword/string value pairs");
json = "[\"^ \", \"~:foo\", \"bar\", \"~:baz\", \"woz\"]";
console.log(reader.read(json));
time(function() {
    for(var i = 0; i < 100000; i++) {
        reader.read(json);
    }
});

console.log("1e5 iters, JSON read transit map with two keyword/number value pairs");
json = "{\"~:foo\":1,\"~:bar\":2}";
console.log(JSON.parse(json));
time(function() {
    for(var i = 0; i < 100000; i++) {
        JSON.parse(json);
    }
});

console.log("1e5 iters, top level read, map two keyword/number value pairs");
reader = transit.reader("json");
console.log(reader.read(json));
time(function() {
    for(var i = 0; i < 100000; i++) {
        reader.read(json);
    }
});

console.log("1e5 iters, top level read, read keyword");
var kws = "\"~:foo\"";
reader = transit.reader("json");
console.log(reader.read(kws))
time(function() {
    for(var i = 0; i < 100000; i++) {
        reader.read(kws);
    }
});

console.log("1e5 iters, JSON.stringify, map two keyword/number value pairs");
var m = {foo:1,bar:2};
console.log(JSON.stringify(m));
time(function() {
    for(var i = 0; i < 100000; i++) {
        JSON.stringify(m);
    }
});

console.log("1e5 iters, top level write, map two keyword/number value pairs");
var writer = transit.writer("json");
console.log(writer.write(m));
time(function() {
    for(var i = 0; i < 100000; i++) {
        writer.write(m);
    }
});

console.log("1 iter, JSON.stringfy JS object with 100000 kv pairs");
var largeMap = {};
for(var i = 0; i < 100000; i++) {
    largeMap["foo"+i] = ["bar"+i, i];
}
time(function() {
    JSON.stringify(largeMap);
});

console.log("1 iter, transit write large JS object with 100000 kv pairs, complex");
largeMap = {},
writer = transit.writer("json");
for(var i = 0; i < 100000; i++) {
    largeMap["~:foo"+i] = [transit.keyword("bar"+i),i];
}
time(function() {
    writer.write(largeMap);
});

console.log("1 iter, transit write large JS object with 100000 kv pairs, simple");
largeMap = {};
writer = transit.writer("json");
for(var i = 0; i < 100000; i++) {
    largeMap["~:foo"+i] = 1;
}
time(function() {
    writer.write(largeMap);
});

console.log("1 iter, JSON.parse JS object with 100000 kv pairs");
arr = [];
for(var i = 0; i < 100000; i++) {
    arr.push("\"foo"+i+"\":[\"bar"+i+"\","+i+"]")
}
largeMap = "{"+arr.join(",")+"}",
json = JSON.parse(largeMap);
console.log(Object.keys(json).length);
console.log(json["foo0"]);
time(function() {
    JSON.parse(largeMap);
});

console.log("1 iter, transit read large transit map with 100000 kv pairs");
arr    = [],
reader = transit.writer("json");
for(var i = 0; i < 100000; i++) {
    arr.push("\"~:foo"+i+"\":[\"~:bar"+i+"\","+i+"]");
}
largeMap = "{"+arr.join(",")+"}",
reader   = transit.reader("json");
var largeTransitMap = reader.read(largeMap);
console.log(Object.keys(largeTransitMap).length);
console.log(largeTransitMap["`~:foo0"]);
time(function() {
    reader.read(largeMap);
});

console.log("100 iters, JSON.parse seattle file");
var fs = require("fs");
json = fs.readFileSync("../transit/seattle-data0.tjs", "utf-8");
time(function() {
    for(var i = 0; i < 100; i++) {
        JSON.parse(json);
    }
});

console.log("100 iters, transit read seattle file");
time(function() {
    for(var i = 0; i < 100; i++) {
        reader.read(json);
    }
});

