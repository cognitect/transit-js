// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var eq      = require("../src/transit/eq.js"),
    t       = require("../src/transit/types.js"),
    wr      = require("../src/transit/writer.js"),
    sr      = require("../src/transit/stringreader.js"),
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
var arr0 = [1,2,3];
time(function() {
    for(var i = 0; i < 1000000; i++) {
        eq.hashCode(arr0);
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
var ts0 = t.set(["foo",1,"bar",[1,2]])
console.log(ts0.has("bar"));
time(function() {
    var key = "bar";
    for(var i = 0; i < 1000000; i++) {
        ts0.has(key);
    }
});


console.log("1e5 iters, marshal {foo:\"bar\"}");
var em0 = new wr.JSONMarshaller(),
    c0  = caching.writeCache(),
    m0  = {foo:"bar"};
wr.marshalTop(em0, m0, c0);
console.log(em0.flushBuffer());
time(function() {
    for(var i = 0; i < 100000; i++) {
        wr.marshalTop(em0, m0, c0);
        em0.flushBuffer();
    }
});

console.log("1e4 iters, marshal {foo:new Date(Date.UTC(1985,3,12,23,20,50,52))}");
var d0  = new Date(Date.UTC(1985,3,12,23,20,50,52)),
    m1  = {foo:d0};
wr.marshalTop(em0, m1, c0);
console.log(em0.flushBuffer());
time(function() {
    for(var i = 0; i < 10000; i++) {
        wr.marshalTop(em0, m1, c0);
        em0.flushBuffer();
    }
});

console.log("1e5 iters, marshal {foo:new Date(Date.UTC(1985,3,12,23,20,50,52))}, (prefersStrings false)");
var em1 = new wr.JSONMarshaller(null, {prefersStrings: false}),
    c1  = caching.writeCache(),
    d1  = new Date(Date.UTC(1985,3,12,23,20,50,52)),
    m2  = {foo:d1};
wr.marshalTop(em1, m2, c1);
console.log(em1.flushBuffer());
time(function() {
    for(var i = 0; i < 100000; i++) {
        wr.marshalTop(em1, m2, c1);
        em1.flushBuffer();
    }
});

console.log("1e5 iters, marshal [1,2,3]");
var arr0 = [1,2,3];
wr.marshalTop(em0, arr0, c0);
console.log(em0.flushBuffer());
time(function() {
    for(var i = 0; i < 100000; i++) {
        wr.marshalTop(em0, arr0, c0);
        em0.flushBuffer();
    }
});

console.log("1e5 iters, JSON read transit map with two keyword/string value pairs");
var json0  = "{\"~:foo\":\"bar\",\"~:baz\":\"woz\"}";
console.log(JSON.parse(json0));
time(function() {
    for(var i = 0; i < 100000; i++) {
        JSON.parse(json0);
    }
});

console.log("1e5 iters, top level read, map two keyword/string value pairs");
var json2  = "{\"~:foo\":\"bar\",\"~:baz\":\"woz\"}",
    ins0   = sr.stringReader(json2),
    reader = transit.reader("json");
reader.read(ins0, function(d) {
    console.log(d);
});
time(function() {
    for(var i = 0; i < 100000; i++) {
        var ins = sr.stringReader(json2);
        reader.read(ins, function(d) {});
    }
});

console.log("1e5 iters, JSON read transit map with two keyword/number value parirs");
var json1  = "{\"~:foo\":1,\"~:bar\":2}";
console.log(JSON.parse(json1));
time(function() {
    for(var i = 0; i < 100000; i++) {
        JSON.parse(json1);
    }
});

console.log("1e5 iters, top level read, map two keyword/number value pairs");
var ins1   = sr.stringReader(json1),
    reader = transit.reader("json");
reader.read(ins1, function(d) {
    console.log(d);
});
time(function() {
    for(var i = 0; i < 100000; i++) {
        var ins = sr.stringReader(json1);
        reader.read(ins, function(d) {});
    }
});

console.log("1e5 iters, top level read, read keyword");
var kws    = "\"~:foo\"",
    kwsr   = sr.stringReader(kws),
    reader = transit.reader("json");
reader.read(kwsr, function(d) {
    console.log(d);
});
time(function() {
    for(var i = 0; i < 100000; i++) {
        kwsr = sr.stringReader(kws);
        reader.read(kwsr, function(d) {});
    }
});

console.log("1e5 iters, JSON.stringify, map two keyword/number value pairs");
var m3 = {foo:1,bar:2};
console.log(JSON.stringify(m3));
time(function() {
    for(var i = 0; i < 100000; i++) {
        JSON.stringify(m3);
    }
});

console.log("1e5 iters, top level write, map two keyword/number value pairs");
var buf     = sb.stringBuilder(),
    writer0 = transit.writer(buf, "json");
writer0.write(m3)
console.log(buf.flush());
time(function() {
    for(var i = 0; i < 100000; i++) {
        writer0.write(m3);
        buf.flush();
    }
});

console.log("1 iter, JSON.stringfy JS object with 100000 kv pairs");
var large0 = {};
for(var i = 0; i < 100000; i++) {
    large0["foo"+i] = ["bar"+i, i];
}
time(function() {
    JSON.stringify(large0);
});

console.log("1 iter, transit write large JS object with 100000 kv pairs");
var large1  = {},
    buf0     = sb.stringBuilder(),
    writer1 = transit.writer(buf0, "json");
for(var i = 0; i < 100000; i++) {
    large1["~:foo"+i] = [t.keyword("bar"+i),i];
}
time(function() {
    writer1.write(large1);
    buf0.flush();
});

console.log("1 iter, JSON.parse JS object with 100000 kv pairs");
var arr3 = []
for(var i = 0; i < 100000; i++) {
    arr3.push("\"foo"+i+"\":[\"bar"+i+"\","+i+"]")
}
var larges0 = "{"+arr3.join(",")+"}",
    json1   = JSON.parse(larges0);
console.log(Object.keys(json1).length);
console.log(json1["foo0"]);
time(function() {
    JSON.parse(larges0);
});

console.log("1 iter, transit read large transit map with 100000 kv pairs");
var arr4   = [],
    buf    = sb.stringBuilder(),
    reader = transit.writer(buf, "json");
for(var i = 0; i < 100000; i++) {
    arr4.push("\"~:foo"+i+"\":[\"~:bar"+i+"\","+i+"]");
}
var larges1 = "{"+arr4.join(",")+"}",
    ins     = sr.stringReader(larges1),
    reader  = transit.reader("json");
reader.read(ins, function(d) {
    console.log(Object.keys(d).length);
    console.log(d["~:foo0"]);
});
time(function() {
    ins = sr.stringReader(larges1);
    reader.read(ins, function(data) {});
});
