// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var eq      = require("../src/transit/eq.js"),
    t       = require("../src/transit/types.js"),
    wr      = require("../src/transit/writer.js"),
    sb      = require("../src/transit/stringbuilder.js"),
    transit = require("../src/transit.js"),
    caching = require("../src/transit/caching.js");

function time(f, iters) {
    iters = iters || 1;
    for(var i = 0; i < iters; i++) {
        var s = new Date();
        f();
        console.log("Elapsed "+((new Date()).valueOf()-s.valueOf())+"ms");
        console.log("----------");
    }
}

console.log("1e6 iters, eq.hashCode(\"foo\")");
time(function() {
    for(var i = 0; i < 1000000; i++) {
        eq.hashCode("foo");
    }
});

console.log("1e6 iters, eq.hashCode([1,2,3])");
var arr = [1,2,3];
time(function() {
    for(var i = 0; i < 1000000; i++) {
        eq.hashCode(arr);
    }
});

console.log("1e6 iters, eq.equals(\"foo\", \"foo\")");
time(function() {
    for(var i = 0; i < 1000000; i++) {
        eq.equals("foo", "foo");
    }
});

console.log("1e6 iters, eq.equals(\"foo\", \"bar\")");
time(function() {
    for(var i = 0; i < 1000000; i++) {
        eq.equals("foo", "bar");
    }
});

console.log("1e6 iters, eq.equals([1,2,3], [1,2,3])");
time(function() {
    var arr0 = [1,2,3],
        arr1 = [1,2,3];
    for(var i = 0; i < 1000000; i++) {
        eq.equals(arr0, arr1);
    }
});

console.log("1e6 iters, eq.equals([1,2,3], [3,2,3])");
time(function() {
    var arr0 = [1,2,3],
        arr1 = [3,2,3];
    for(var i = 0; i < 1000000; i++) {
        eq.equals(arr0, arr1);
    }
});

console.log("1e6 iters, eq.equals(new Keyword(\"foo\"), new Keyword(\"foo\"))");
time(function() {
    var k0 = t.Keyword("foo"),
        k1 = t.Keyword("foo");
    for(var i = 0; i < 1000000; i++) {
        eq.equals(k0, k1);
    }
});

console.log("1e6 iters, eq.equals(t.date(1399471321791), t.date(1399471321791))");
time(function() {
    var d0 = t.date(1399471321791),
        d1 = t.date(1399471321791);
    for(var i = 0; i < 1000000; i++) {
        eq.equals(d0, d1);
    }
});

console.log("1e6 iters, eq.equals(new Keyword(\"foo\"), new Keyword(\"bar\"))");
time(function() {
    var k0 = t.Keyword("foo"),
        k1 = t.Keyword("bar");
    for(var i = 0; i < 1000000; i++) {
        eq.equals(k0, k1);
    }
});

console.log("1e6 iters, eq.equals({foo: \"bar\"}, {foo: \"bar\"})");
time(function() {
    var obj0 = {foo: "bar"},
        obj1 = {foo: "bar"};
    for(var i = 0; i < 1000000; i++) {
        eq.equals(obj0, obj1);
    }
});

console.log("1e6 iters, TransitMap tm0.get(\"foo\")");
var tm0 = t.map(["foo", "transit map string lookup"]);
console.log(tm0.get("foo"));
time(function() {
    for(var i = 0; i < 1000000; i++) {
        tm0.get("foo");
    }
});

console.log("1e5 iters, TransitMap tm0.get([1,2])");
var tm1 = t.map([[1,2], "transit map array lookup"]);
console.log(tm1.get([1,2]));
time(function() {
    var key = [1,2];
    for(var i = 0; i < 100000; i++) {
        tm1.get(key);
    }
});

console.log("1e6 iters, Complex TransitSet \"bar\"");
var ts = t.set(["foo",1,"bar",[1,2]])
console.log(ts.has("bar"));
time(function() {
    var key = "bar";
    for(var i = 0; i < 1000000; i++) {
        ts.has(key);
    }
});


console.log("1e5 iters, marshal {foo:\"bar\"}");
var em = new wr.JSONMarshaller(),
    c  = caching.writeCache(),
    m  = {foo:"bar"};
wr.marshalTop(em, m, c);
console.log(em.flushBuffer());
time(function() {
    for(var i = 0; i < 100000; i++) {
        wr.marshalTop(em, m, c);
        em.flushBuffer();
    }
});

console.log("1e4 iters, marshal {foo:new Date(Date.UTC(1985,3,12,23,20,50,52))}");
var d = new Date(Date.UTC(1985,3,12,23,20,50,52));
m = {foo:d};
wr.marshalTop(em, m, c);
console.log(em.flushBuffer());
time(function() {
    for(var i = 0; i < 10000; i++) {
        wr.marshalTop(em, m, c);
        em.flushBuffer();
    }
});

console.log("1e5 iters, marshal {foo:new Date(Date.UTC(1985,3,12,23,20,50,52))}, (prefersStrings false)");
em = new wr.JSONMarshaller({prefersStrings: false}),
c  = caching.writeCache(),
d  = new Date(Date.UTC(1985,3,12,23,20,50,52)),
m  = {foo:d};
wr.marshalTop(em, m, c);
console.log(em.flushBuffer());
time(function() {
    for(var i = 0; i < 100000; i++) {
        wr.marshalTop(em, m, c);
        em.flushBuffer();
    }
});

console.log("1e5 iters, marshal [1,2,3]");
arr = [1,2,3];
wr.marshalTop(em, arr, c);
console.log(em.flushBuffer());
time(function() {
    for(var i = 0; i < 100000; i++) {
        wr.marshalTop(em, arr, c);
        em.flushBuffer();
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

console.log("1e5 iters, JSON read transit map with two keyword/number value parirs");
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
m = {foo:1,bar:2};
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
    largeMap["~:foo"+i] = [t.keyword("bar"+i),i];
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
