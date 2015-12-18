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

var transit = require("../target/transit.js"),
    vm      = require("vm"),
    ctxt    = vm.createContext();

// =============================================================================
// Equality & Hashing
// =============================================================================

exports.testEquality = function(test) {

    test.ok(transit.equals(1, 1));
    test.ok(!transit.equals(1, 2));
    test.ok(transit.equals(transit.integer("1"), transit.integer("1")));
    test.ok(!transit.equals(transit.integer("1"), transit.integer("2")));
    test.ok(transit.equals("foo", "foo"));
    test.ok(!transit.equals("foo", "bar"));
    test.ok(transit.equals([], []));
    test.ok(transit.equals([1,2,3], [1,2,3]));
    test.ok(!transit.equals([2,2,3], [1,2,3]));
    test.ok(transit.equals([1,[2,3],4], [1,[2,3],4]));
    test.ok(!transit.equals([1,[3,3],4], [1,[2,3],4]));
    test.ok(!transit.equals([1,2,3], {}));
    test.ok(transit.equals({}, {}));
    test.ok(transit.equals({foo: "bar"}, {foo: "bar"}));
    test.ok(!transit.equals({foo: "bar", baz: "woz"}, {foo: "bar"}));
    test.ok(!transit.equals({foo: "bar"}, {foo: "baz"}));
    test.ok(transit.equals(transit.date(1399471321791), transit.date(1399471321791)));
    test.ok(!transit.equals(transit.date(1399471321791), transit.date(1399471321792)));

    var o  = {foo: "bar", baz: "woz"},
        hc = transit.hash(o);

    test.ok(transit.equals(o, {foo: "bar", baz: "woz"}));

    var o1  = {foo: "bar", baz: "woz"},
        hc1 = transit.hash(o1),
        o2  = {foo: "bar", baz: "woz"},
        hc2 = transit.hash(o2);

    test.ok(!transit.equals(null, 1));
    test.ok(!transit.equals(1, null));
    test.ok(!transit.equals(null, []));
    test.ok(!transit.equals([], null));
    test.ok(!transit.equals(null, {}));
    test.ok(!transit.equals({}, null));

    test.ok(!transit.equals(undefined, 1));
    test.ok(!transit.equals(1, undefined));
    test.ok(!transit.equals(undefined, []));
    test.ok(!transit.equals([], undefined));
    test.ok(!transit.equals(undefined, {}));
    test.ok(!transit.equals({}, undefined));

    test.equal(transit.hash(null), 0);
    test.equal(transit.hash(undefined), 0);

    test.done();
};

exports.testEqualitySymbolsAndKeywords = function(test) {

    var k0 = transit.keyword("foo"),
        k1 = transit.keyword("foo"),
        k2 = transit.keyword("bar"),
        s0 = transit.symbol("foo"),
        s1 = transit.symbol("foo"),
        s2 = transit.symbol("bar");

    test.ok(transit.equals(k0, k1));
    test.ok(!transit.equals(k0, k2));
    test.ok(transit.equals(s0, s1));
    test.ok(!transit.equals(s0, s2));

    test.done();
};

exports.testKeywordSymbolNamespaces = function(test) {
    var k0 = transit.keyword("foo/bar"),
        k1 = transit.keyword("foo");

    test.equal(k0.namespace(), "foo");
    test.equal(k0.name(), "bar");
    test.equal(k1.namespace(), null);
    test.equal(k1.name(), "foo");

    var s0 = transit.symbol("foo/bar"),
        s1 = transit.symbol("foo");

    test.equal(s0.namespace(), "foo");
    test.equal(s0.name(), "bar");
    test.equal(s1.namespace(), null);
    test.equal(s1.name(), "foo");

    test.done();
};

exports.testHashCode = function(test) {

    test.equal(transit.hash("foo"), transit.hash("foo"));
    test.notEqual(transit.hash("foo"), transit.hash("fop"));
    test.equal(transit.hash([]), 0);
    test.equal(transit.hash([1,2,3]), transit.hash([1,2,3]));
    test.notEqual(transit.hash([1,2,3]), transit.hash([1,2,4]));
    test.equal(transit.hash({foo: "bar"}), transit.hash({foo: "bar"}));
    test.notEqual(transit.hash({foo: "bar"}), transit.hash({foo: "baz"}));
    test.equal(transit.hash({}), transit.hash({}));
    test.equal(transit.hash(new Date(2014,4,6)), transit.hash(new Date(2014,4,6)));

    test.done();
};

// =============================================================================
// Numbers
// =============================================================================

exports.testIntegers = function(test) {
    test.equal(typeof transit.integer("9007199254740991"), "number");
    test.equal(typeof transit.integer("9007199254740992"), "object");
    test.equal(typeof transit.integer("-9007199254740991"), "number");
    test.equal(typeof transit.integer("-9007199254740992"), "object");
    test.done();
};

// =============================================================================
// TransitMap
// =============================================================================

exports.testTransitMapBasic = function(test) {

    var m0 = transit.map([]);

    test.ok(m0.size == 0);

    var m1 = transit.map(["foo", "bar"]);

    test.ok(m1.size == 1);
    test.ok(m1.has("foo"));
    test.equal(m1.get("foo"), "bar");

    var m2 = transit.map(["foo", "bar", 101574, "baz"]);

    test.ok(m2.size == 2);
    test.ok(m2.has("foo") && m2.has(101574));
    test.ok((m2.get("foo") == "bar") && (m2.get(101574) == "baz"));

    var m3 = transit.map(["foo", "bar"]);

    test.equal(transit.hash(m1), transit.hash(m3));

    var m4 = transit.map(["foo", "bop"]);

    test.notEqual(transit.hash(m3), transit.hash(m4));

    var m5 = transit.map([[1,2], "foo", [3,4], "bar"]);

    test.ok(m5.get([1,2]) === "foo" && (m5.get([3,4]) === "bar"));

    var m5 = transit.map(["foo", "bar", "foo", "baz"]);

    test.equal(m5.size, 1);
    test.equal(m5.get("foo"), "baz");

    var m6 = transit.map(["foo", "bar", "baz", "woz"]),
        m7 = transit.map(["foo", "bar", "baz", "woz"]),
        m8 = transit.map(["baz", "woz", "foo", "bar"]);

    test.ok(transit.equals(m6,m7));
    test.ok(transit.equals(m7,m8))

    var m9  = transit.map([transit.keyword("foo"), "bar"]),
        m10 = transit.map([transit.keyword("foo"), "bar"]);

    test.ok(transit.equals(m9, m10));

    test.done();
};

exports.testTransitMapIntermediate = function(test) {
    var m = transit.map();

    m.set(transit.keyword("foo"), "bar");

    test.ok(m.has(transit.keyword("foo")), "bar");
    test.equal(m.get(transit.keyword("foo")), "bar");
    test.equal(m.size, 1);

    m.clear();

    test.equal(m.has(transit.keyword("foo")), false);
    test.equal(m.get(transit.keyword("foo")), null);
    test.equal(m.size, 0);

    test.done();
};

exports.testTransitMapVerbose = function(test) {
    var r = transit.reader("json"),
        s = "{\"~:foo\":\"bar\"}";

    test.ok(transit.equals(r.read(s), transit.map([transit.keyword("foo"), "bar"])));

    test.done();
};

exports.testTransitMapKeySet = function(test) {
    var m0 = transit.map(["foo", 1, "bar", 2, "baz", 3]);

    test.deepEqual(m0.keySet().sort(), ["foo", "bar", "baz"].sort());

    test.done();
};

exports.testTransitMapKeys = function(test) {
    var m0   = transit.map(["foo", 1, "bar", 2, "baz", 3]),
        iter = m0.keys(),
        ks   = [];

    ks.push(iter.next().value);
    ks.push(iter.next().value);
    ks.push(iter.next().value);

    test.ok(iter.next().done);
    test.deepEqual(ks.sort(), ["foo", "bar", "baz"].sort());

    test.done();
};

exports.testTransitMapValues = function(test) {
    var m0   = transit.map(["foo", 1, "bar", 2, "baz", 3]),
        iter = m0.values(),
        xs   = [];

    xs.push(iter.next().value);
    xs.push(iter.next().value);
    xs.push(iter.next().value);

    test.ok(iter.next().done);
    test.deepEqual(xs.sort(), [1,2,3].sort());

    test.done();
};

exports.testTransitMapEntries = function(test) {
    var m0   = transit.map(["foo", 1, "bar", 2, "baz", 3]),
        iter = m0.entries(),
        kvs  = [];

    kvs.push(iter.next().value);
    kvs.push(iter.next().value);
    kvs.push(iter.next().value);

    test.ok(iter.next().done);
    test.deepEqual(kvs.sort(), [["foo", 1],["bar",2],["baz",3]].sort());

    test.done();
};

exports.testTransitMapDelete = function(test) {
    var m0 = transit.map(["foo", 1, "bar", 2, "baz", 3]);

    var v = m0.delete("foo");

    test.equal(v, 1);
    test.equal(m0.size, 2);
    test.equal(m0.has("foo"), false);
    test.deepEqual(m0.keySet().sort(), ["bar","baz"].sort());

    test.done();
};

exports.testTransitMapObjectEquality = function(test) {
    var o0 = {"foo": 1, "bar": 2},
        o1 = {"foo": 1, "bar": 2, "baz": 3},
        o2 = {"foo": 1},
        m  = transit.map(["foo", 1, "bar", 2]);

    test.ok(transit.equals(o0, m));
    test.ok(transit.equals(m, o0));
    test.ok(!transit.equals(o1, m));
    test.ok(!transit.equals(m, o1));
    test.ok(!transit.equals(o2, m));
    test.ok(!transit.equals(m, o2));

    test.done();
};

// =============================================================================
// TransitSet
// =============================================================================

exports.testTransitSetBasic = function(test) {
    var s0 = transit.set([]);

    test.equal(s0.size, 0);

    var s1 = transit.set([1]);

    test.equal(s1.size, 1);

    var s2 = transit.set([1,1,2]);

    test.equal(s2.size, 2);

    var s3 = transit.set(["foo","bar","baz"]);
    test.ok(s3.has("foo") && s3.has("bar"), s3.has("baz"));

    var s4 = transit.set(["baz","bar","foo"]);
    test.ok(transit.equals(s3,s4));

    var s5 = transit.set(["foo",1,"bar",[1,2]]);
    test.ok(s5.has("bar"));

    test.done();
};

exports.testTransitSetKeys = function(test) {
    var s0   = transit.set(["foo", "bar", "baz"]),
        iter = s0.keys(),
        ks   = [];
    
    ks.push(iter.next().value);
    ks.push(iter.next().value);
    ks.push(iter.next().value);

    test.ok(iter.next().done);
    test.deepEqual(ks.sort(), ["foo", "bar", "baz"].sort());

    test.done();
};

exports.testTransitSetValues = function(test) {
    var s0   = transit.set(["foo", "bar", "baz"]),
        iter = s0.values(),
        vs   = [];
    
    vs.push(iter.next().value);
    vs.push(iter.next().value);
    vs.push(iter.next().value);

    test.ok(iter.next().done);
    test.deepEqual(vs.sort(), ["foo", "bar", "baz"].sort());

    test.done();
};

exports.testTransitSetEntries = function(test) {
    var s0   = transit.set(["foo", "bar", "baz"]),
        iter = s0.entries(),
        kvs  = [];

    kvs.push(iter.next().value);
    kvs.push(iter.next().value);
    kvs.push(iter.next().value);

    test.ok(iter.next().done);
    test.deepEqual(kvs.sort(), [["foo","foo"],["bar","bar"],["baz","baz"]].sort());

    test.done();
};

exports.testTransitSetDelete = function(test) {
    var s0 = transit.set(["foo", "bar", "baz"]);
    
    var v = s0.delete("bar");

    test.equal(v, "bar");
    test.equal(s0.size, 2);
    test.ok(!s0.has("bar"));
    test.deepEqual(s0.keySet().sort(), ["foo", "baz"].sort());

    test.done();
};

// =============================================================================
// UUID
// =============================================================================

exports.testUUIDfromString = function(test) {
    test.equal(transit.uuid("531a379e-31bb-4ce1-8690-158dceb64be6").toString(),
               "531a379e-31bb-4ce1-8690-158dceb64be6");

    test.done();
};

// =============================================================================
// API
// =============================================================================

exports.testWrite = function(test) {
    var writer = transit.writer("json");
    test.equal(writer.write({foo:"bar"}), "[\"^ \",\"foo\",\"bar\"]");
    test.equal(writer.write([{foobar:"foobar"},{foobar:"foobar"}]), "[[\"^ \",\"foobar\",\"foobar\"],[\"^ \",\"^0\",\"foobar\"]]");
    test.done();
};

exports.testWriteVerboseMode = function(test) {
    var writer = transit.writer("json-verbose");
    test.equal(writer.write({foo:"bar"}), "{\"foo\":\"bar\"}");
    test.equal(writer.write([{foobar:"foobar"},{foobar:"foobar"}]), "[{\"foobar\":\"foobar\"},{\"foobar\":\"foobar\"}]");
    test.equal(writer.write(transit.date(1399471321791)), "{\"~#\'\":\"~t2014-05-07T14:02:01.791Z\"}");
    test.done();
};

exports.testRead = function(test) {
    var reader = transit.reader("json");
    test.ok(transit.equals(reader.read("{\"foo\":\"bar\"}"), {foo:"bar"}));
    test.done();
};

exports.testWriteTransitTypes = function(test) {
    var writer  = transit.writer("json"),
        writerv = transit.writer("json-verbose");
    
    test.equal(writer.write(["foo"]), "[\"foo\"]");
    test.equal(writer.write([1]), "[1]");
    test.equal(writer.write([transit.integer("9007199254740993")]), "[\"~i9007199254740993\"]");
    test.equal(writer.write([transit.integer("-9007199254740993")]), "[\"~i-9007199254740993\"]");
    test.equal(writer.write([1.5]), "[1.5]");
    test.equal(writer.write([true]), "[true]");
    test.equal(writer.write([false]), "[false]");
    test.equal(writer.write([transit.keyword("foo")]), "[\"~:foo\"]");
    test.equal(writer.write([transit.symbol("foo")]), "[\"~$foo\"]");
    test.equal(writer.write([transit.date(482196050052)]), "[\"~m482196050052\"]");
    test.equal(writer.write([transit.keyword("foo"),transit.symbol("bar")]), "[\"~:foo\",\"~$bar\"]");
    test.equal(writer.write([transit.symbol("foo"),transit.keyword("bar")]), "[\"~$foo\",\"~:bar\"]");
    test.equal(writer.write([transit.uri("http://foo.com/")]), "[\"~rhttp://foo.com/\"]");
    test.equal(writer.write(transit.list([1,2,3])), "[\"~#list\",[1,2,3]]");
    test.equal(writer.write([transit.list([1,2,3])]), "[[\"~#list\",[1,2,3]]]");
    test.equal(writer.write(transit.uuid("531a379e-31bb-4ce1-8690-158dceb64be6")), "[\"~#\'\",\"~u531a379e-31bb-4ce1-8690-158dceb64be6\"]");
    test.equal(writerv.write(transit.uuid("531a379e-31bb-4ce1-8690-158dceb64be6")), "{\"~#\'\":\"~u531a379e-31bb-4ce1-8690-158dceb64be6\"}");
    test.equal(writer.write([transit.uuid("531a379e-31bb-4ce1-8690-158dceb64be6")]), "[\"~u531a379e-31bb-4ce1-8690-158dceb64be6\"]");
    test.equal(writer.write([transit.binary("c3VyZS4=")]), "[\"~bc3VyZS4=\"]");
    
    test.done();
};

exports.testWriteTransitComplexTypes = function(test) {
    var writer = transit.writer("json"),
        s0     = transit.set(["foo","bar","baz"]),
        m0     = transit.map(["foo","bar","baz","woz"]);
    test.equal(writer.write(s0),"[\"~#set\",[\"foo\",\"bar\",\"baz\"]]");
    test.done();
}; 

exports.testRoundtrip = function(test) {
    var writer = transit.writer("json"),
        s      = "[\"~#set\",[\"foo\",\"bar\",\"baz\"]]",
        reader = transit.reader("json");
    test.equal(s, writer.write(reader.read(s)));
    test.done();
};

exports.testWriteTransitObjectMap = function(test) {
    var x      = {"~:foo0": [transit.keyword("bar"+0), 0],
                  "~:foo1": [transit.keyword("bar"+1), 1]},
        writer = transit.writer("json");
    //test.equal(writer.write(x),"{\"~~:foo0\":[\"~:bar0\",0],\"~~:foo1\":[\"~:bar1\",1]}");
    test.done();
};

exports.testWriteEdgeCases = function(test) {

    var writer = transit.writer("json");

    test.equal(writer.write([[1,2]]), "[[1,2]]");
    test.equal(writer.write([[1,2],[3,4]]), "[[1,2],[3,4]]");
    test.equal(writer.write([[[1,2]]]), "[[[1,2]]]");
    test.equal(writer.write([{foo:[1,2]}]), "[[\"^ \",\"foo\",[1,2]]]");
    //test.equal(writer.write([{foo:[1,2,{}]}]), "[[\"^ \",\"foo\",[1,2,{}]}]"); // NOTE: how should empty maps gets written? - David
    test.equal(writer.write({foo:{bar:1,noz:3},baz:{woz:2,goz:4}}), "[\"^ \",\"foo\",[\"^ \",\"bar\",1,\"noz\",3],\"baz\",[\"^ \",\"woz\",2,\"goz\",4]]");

    test.done();
};

exports.testCustomHandler = function(test) {
    var Point = function(x, y) {
        this.x = x;
        this.y = y;
    };

    var PointHandler = transit.makeWriteHandler({
            tag: function(v) { return "point"; },
            rep: function(v) { return transit.tagged("array", [v.x, v.y]); },
            stringRep: function(v) { return null; }
        }),
        writer = transit.writer("json", {
            handlers: transit.map([Point, PointHandler])
        });

    test.equal(writer.write(new Point(1.5,2.5)), "[\"~#point\",[1.5,2.5]]");

    test.done();
};

exports.testCustomHandlerKeyMap = function(test) {
    var Point = function(x, y) {
        this.x = x;
        this.y = y;
    };

    var PointHandler = transit.makeWriteHandler({
            tag: function(v) { return "point"; },
            rep: function(v) { return transit.tagged("array", [v.x, v.y]); },
            stringRep: function(v) { return null; }
        }),
        w = transit.writer("json", {
            handlers: transit.map([Point, PointHandler])
        }),
        m = transit.map([new Point(1.5,2.5),1]);

    test.equal(w.write(m), "[\"~#cmap\",[[\"~#point\",[1.5,2.5]],1]]");

    test.done();
};

exports.testWriteOptions = function(test) {
    var w = transit.writer("json");

    test.equal(w.write(transit.keyword("foo"), {marshalTop:false}), "~:foo");
    test.equal(w.write(transit.integer("1"), {marshalTop:false}), "1");

    test.done();
};

exports.testDecoder = function(test) {
    var d = transit.decoder();

    test.equal(d.decode("1"), 1);

    test.done();
};

exports.testWriteCMap = function(test) {
    var w0 = transit.writer("json"),
        m  = transit.map([[1,2], "foo"]),
        w1 = transit.writer("json-verbose");

    test.equal(w0.write(m), "[\"~#cmap\",[[1,2],\"foo\"]]");
    test.equal(w1.write(m), "{\"~#cmap\":[[1,2],\"foo\"]}");

    test.done();
};

// =============================================================================
// Links
// =============================================================================

exports.testLink = function(test) {
    var w = transit.writer(),
        r = transit.reader(),
        l = r.read("{\"~#link\":{\"href\":\"~rhttp://foo.com\",\"rel\":\"a-rel\",\"name\":\"a-name\",\"render\":\"image\",\"prompt\":\"a-prompt\"}}");

    test.ok(transit.isURI(l.rep.get("href")));
    test.equal(l.rep.get("rel"), "a-rel");
    test.equal(l.rep.get("name"), "a-name");
    test.equal(l.rep.get("render"), "image");
    test.equal(l.rep.get("prompt"), "a-prompt");

    test.done();
};

// =============================================================================
// JSON-M
// =============================================================================

exports.testVerifyArrayHash = function(test) {
    var reader = transit.reader("json");

    test.ok(transit.equals(reader.read("[\"^ \", \"~:foo\", \"bar\"]"),
                           transit.map([transit.keyword("foo"), "bar"])));

    test.done();
};

exports.testVerifyArrayHashWithCaching = function(test) {
    var reader = transit.reader("json");

    test.ok(transit.equals(reader.read("[\"^ \", \"~:foo\", \"^0\"]"),
                           transit.map([transit.keyword("foo"), transit.keyword("foo")])));

    test.done();
};

exports.testStringableKeys = function(test) {
    var em  = transit.writer("json").marshaller(),
        m0 = transit.map(["foo", 1, "bar", 2]);

    test.ok(transit.stringableKeys(em, m0));

    var m1 = transit.map([transit.keyword("foo"), 1,
                          transit.keyword("bar"), 2]);

    test.ok(transit.stringableKeys(em, m1));

    var m2 = transit.map([["foo"], 1, ["bar"], 2]);

    test.ok(!transit.stringableKeys(em, m2));
    
    test.done();
};

// =============================================================================
// Array Tagged Value
// =============================================================================

exports.testReadArrayTaggedValue = function(test) {
    var r = transit.reader("json"),
        s = r.read("[\"~#set\",[1,2,3]]");

    test.ok(transit.isSet(s));
    test.equal(s.size, 3);
    test.ok(s.has(1));
    test.ok(s.has(2));
    test.ok(s.has(3));

    test.done();
};

// =============================================================================
// Default decoder
// =============================================================================

exports.testDefaultHandler = function(test) {
    var r = transit.reader("json", {
        defaultHandler: function(tag, value) {
            throw new Error("Oops!");
        }
    });

    try {
        r.read("[\"~q1\"]");
    } catch(e) {
        test.equal(e.message, "Oops!");
        test.done();
    }
};

// =============================================================================
// Write Foreign Handler
// =============================================================================

exports.testHandlerForForeign = function(test) {
    var x = vm.runInContext("(function(){return [];})()", ctxt, "test"),
        y = vm.runInContext("(function(){return {};})()", ctxt, "test"),
        w = transit.writer("json", {
            handlerForForeign: function(x, handlers) {
                if(Array.isArray(x)) {
                    return handlers.get(Array);
                } else if(typeof x == "object") {
                    return handlers.get(Object);
                }
            }
        });

    test.equal(w.write(x), "[]");
    test.equal(w.write(y), "[\"^ \"]");
    test.equal(w.write(y), "[\"^ \"]");

    test.done();
};

// =============================================================================
// mapToObject
// =============================================================================

exports.testMapToObject = function(test) {
    var m = transit.map([
        "foo", 1,
        "bar", 2,
        "baz", 3
    ]);

    test.deepEqual(transit.mapToObject(m), {foo:1,bar:2,baz:3});

    test.done();
};

// =============================================================================
// objectToMap
// =============================================================================

exports.testObjectToMap = function(test) {
    var o = {
            "foo": 1,
            "bar": 2,
            "baz": 3
        },
        m0 = transit.map([
            "foo", 1,
            "bar", 2,
            "baz", 3
        ]),
        m1 = transit.map([
            "foo", 1,
            "bar", 2,
            "baz", 4
        ]);

    test.ok(transit.equals(transit.objectToMap(o), m0));
    test.ok(transit.equals(m0, transit.objectToMap(o)));
    test.ok(!transit.equals(transit.objectToMap(o), m1));
    test.ok(!transit.equals(m1, transit.objectToMap(o)));

    test.done();
};

// =============================================================================
// Tag Edge Case
// =============================================================================

exports.testTagEdgeCase = function(test) {
    var r = transit.reader("json"),
        w = transit.writer("json");

    test.ok(transit.equals(r.read("{\"~~:set\":[1,2,3]}"),
                           transit.map(["~:set",[1,2,3]])));

    test.ok(transit.equals(r.read("[\"^ \",\"~~:set\",[1,2,3]]"),
                           transit.map(["~:set",[1,2,3]])));

    test.ok(transit.equals(r.read("[{\"~~:set\":[1,2,3]},{\"^0\":[1,2,3]}]"),
                           [transit.map(["~:set",[1,2,3]]),transit.map(["~:set",[1,2,3]])]));

    test.ok(transit.equals(r.read("[[\"^ \",\"~~:set\",[1,2,3]],[\"^ \",\"^0\",[1,2,3]]]"),
                           [transit.map(["~:set",[1,2,3]]),transit.map(["~:set",[1,2,3]])]));

    test.done();
};

// =============================================================================
// Verify Test Cases
// =============================================================================

function roundtrip(s) {
    var reader = transit.reader("json"),
        writer = transit.writer("json");
    return writer.write(reader.read(s));
}

exports.testVerifyRoundTripCachedKeys = function(test) {
    test.equal(roundtrip("[\"~:foo\",\"~:bar\",[\"^ \",\"^1\",[1,2]]]"), "[\"~:foo\",\"~:bar\",[\"^ \",\"^1\",[1,2]]]");
    test.done();
};

exports.testQuoted = function(test) {
    var reader = transit.reader("json"),
        writer = transit.writer("json");

    test.equal(reader.read("[\"~#\'\",null]"), null);
    test.equal(writer.write(null), "[\"~#\'\",null]");
    test.equal(reader.read("[\"~#\'\",1]"), 1);
    test.equal(writer.write(1), "[\"~#\'\",1]");
    test.equal(reader.read("[\"~#\'\",2.5]"), 2.5);
    test.equal(writer.write(2.5), "[\"~#\'\",2.5]");
    test.equal(reader.read("[\"~#\'\",\"foo\"]"), "foo");
    test.equal(writer.write("foo"), "[\"~#\'\",\"foo\"]");
    test.equal(reader.read("[\"~#\'\",true]"), true);
    test.equal(writer.write(true), "[\"~#\'\",true]");
    test.equal(reader.read("[\"~#\'\",false]"), false);
    test.equal(writer.write(false), "[\"~#\'\",false]");
    test.ok(transit.equals(reader.read("[\"~#\'\",\"~m0\"]"), new Date(0)));
    test.ok(transit.equals(writer.write(new Date(0)), "[\"~#\'\",\"~m0\"]"));
    test.ok(transit.equals(reader.read("[\"~#\'\",\"~i4953778853208128465\"]"), transit.integer("4953778853208128465")));
    test.ok(transit.equals(writer.write(transit.integer("4953778853208128465")), "[\"~#\'\",\"~i4953778853208128465\"]"));
    test.ok(transit.equals(reader.read("[\"~#\'\",\"~n8987676543234565432178765987645654323456554331234566789\"]"),
                           transit.bigInt("8987676543234565432178765987645654323456554331234566789")));
    test.ok(transit.equals(writer.write(transit.bigInt("8987676543234565432178765987645654323456554331234566789")),
                          "[\"~#\'\",\"~n8987676543234565432178765987645654323456554331234566789\"]"));

    test.done();
};

exports.testVerifyJSONCornerCases = function(test) {
    test.equal(roundtrip("[\"~#point\",[1,2]]"), "[\"~#point\",[1,2]]");
    test.equal(roundtrip("[\"^ \",\"foo\",\"~xfoo\"]"), "[\"^ \",\"foo\",\"~xfoo\"]");
    test.equal(roundtrip("[\"^ \",\"~/t\",null]"), "[\"^ \",\"~/t\",null]");
    test.equal(roundtrip("[\"^ \",\"~/f\",null]"), "[\"^ \",\"~/f\",null]");
    test.equal(roundtrip("{\"~#'\":\"~f-1.1E-1\"}"), "[\"~#\'\",\"~f-1.1E-1\"]");
    test.equal(roundtrip("{\"~#'\":\"~f-1.10E-1\"}"), "[\"~#\'\",\"~f-1.10E-1\"]");
    test.equal(roundtrip(
                "[\"~#set\",[[\"~#ratio\",[\"~i4953778853208128465\",\"~i636801457410081246\"]],[\"^1\",[\"~i-8516423834113052903\",\"~i5889347882583416451\"]]]]"),
                "[\"~#set\",[[\"~#ratio\",[\"~i4953778853208128465\",\"~i636801457410081246\"]],[\"^1\",[\"~i-8516423834113052903\",\"~i5889347882583416451\"]]]]");

    test.done();
};

exports.testVerifyRoundtripCmap = function(test) {
    test.equal(roundtrip("[\"~#cmap\",[[1,1],\"one\"]]"), "[\"~#cmap\",[[1,1],\"one\"]]");
    test.equal(roundtrip("[\"~#cmap\",[[\"~:foo\",1],[[\"^ \",\"~:bar\",2],[\"^ \",\"^2\",3]]]]"),
                         "[\"~#cmap\",[[\"~:foo\",1],[[\"^ \",\"~:bar\",2],[\"^ \",\"^2\",3]]]]");
    test.done();
};

exports.testVerifyRoundtripMapCachedStrings = function(test) {
    test.equal(roundtrip('[["^ ","aaaa",1,"bbbb",2],["^ ","^0",3,"^1",4],["^ ","^0",5,"^1",6]]'),
                         '[["^ ","aaaa",1,"bbbb",2],["^ ","^0",3,"^1",4],["^ ","^0",5,"^1",6]]');
    test.done();
};

exports.testVerifyRoundtripEmptyString = function(test) {
    test.equal(roundtrip("[\"\",\"a\",\"ab\",\"abc\",\"abcd\",\"abcde\",\"abcdef\"]"),
                         "[\"\",\"a\",\"ab\",\"abc\",\"abcd\",\"abcde\",\"abcdef\"]");
    test.done();
};

exports.testVerifyRoundtripBigInteger = function(test) {
     test.equal(roundtrip("{\"~#'\":\"~n8987676543234565432178765987645654323456554331234566789\"}"),
                          "[\"~#'\",\"~n8987676543234565432178765987645654323456554331234566789\"]");
     test.done();
};

exports.testRoundtripLongKey = function(test) {
    var r = transit.reader("json");

    test.deepEqual(r.read("\{\"~i1\":\"foo\"}"), transit.map([1, "foo"]));

    test.done();
};

exports.testDisableWriteCaching = function(test) {
    var writer = transit.writer("json", {cache: false});
    test.equal(writer.write([transit.keyword("foo"), transit.keyword("foo")]), "[\"~:foo\",\"~:foo\"]");
    test.done();
};

exports.testRoundtripVerboseDates = function(test) {
    var r = transit.reader("json"),
        w = transit.writer("json-verbose");

    test.equal(w.write(r.read("[\"~t1776-07-04T12:00:00.000Z\",\"~t1970-01-01T00:00:00.000Z\",\"~t2000-01-01T12:00:00.000Z\",\"~t2014-04-07T22:17:17.000Z\"]")),
                              "[\"~t1776-07-04T12:00:00.000Z\",\"~t1970-01-01T00:00:00.000Z\",\"~t2000-01-01T12:00:00.000Z\",\"~t2014-04-07T22:17:17.000Z\"]");
    
    test.done();
};

exports.testRoundtripBigInteger = function(test) {
    test.equal(roundtrip("[\"~n1\"]"), "[\"~n1\"]");
    test.done();
};

exports.testRoundtripUUIDCornerCase = function(test) {
    test.equal(roundtrip("{\"~#'\":\"~u2f9e540c-0591-eff5-4e77-267b2cb3951f\"}"),
                         "[\"~#'\",\"~u2f9e540c-0591-eff5-4e77-267b2cb3951f\"]");
    test.done();
};

exports.testMapCornerCase = function(test) {
    test.equal(roundtrip("[\"^ \"]"), "[\"^ \"]");
    test.done();
};

exports.testMapKeyRatioCase = function(test) {
    test.equal(roundtrip("[\"~#cmap\",[[\"~#ratio\",[\"~n1\",\"~n2\"]],[\"^1\",[\"~n2\",\"~n5\"]]]]"),
                         "[\"~#cmap\",[[\"~#ratio\",[\"~n1\",\"~n2\"]],[\"^1\",[\"~n2\",\"~n5\"]]]]");
    test.equal(roundtrip("[\"~#cmap\",[[\"~#ratio\",[\"~n10\",\"~n11\"]],\"~:foobar\",[\"^1\",[\"~n10\",\"~n13\"]],\"^2\"]]"),
                         "[\"~#cmap\",[[\"~#ratio\",[\"~n10\",\"~n11\"]],\"~:foobar\",[\"^1\",[\"~n10\",\"~n13\"]],\"^2\"]]");
    test.done();
};

exports.testRoundTripEscapedString = function(test) {
    test.equal(roundtrip("{\"~#\'\":\"~\`~hello\"}"),
                         "[\"~#\'\",\"~\`~hello\"]");

    test.done();
};

exports.testRollingCacheEdgeCase = function(test) {
    test.equal(roundtrip("[\"~:key0000\",\"~:key0001\",\"~:key0002\",\"~:key0003\",\"~:key0004\",\"~:key0005\",\"~:key0006\",\"~:key0007\",\"~:key0008\",\"~:key0009\",\"~:key0010\",\"~:key0011\",\"~:key0012\",\"~:key0013\",\"~:key0014\",\"~:key0015\",\"~:key0016\",\"~:key0017\",\"~:key0018\",\"~:key0019\",\"~:key0020\",\"~:key0021\",\"~:key0022\",\"~:key0023\",\"~:key0024\",\"~:key0025\",\"~:key0026\",\"~:key0027\",\"~:key0028\",\"~:key0029\",\"~:key0030\",\"~:key0031\",\"~:key0032\",\"~:key0033\",\"~:key0034\",\"~:key0035\",\"~:key0036\",\"~:key0037\",\"~:key0038\",\"~:key0039\",\"~:key0040\",\"~:key0041\",\"~:key0042\",\"~:key0043\",\"~:key0044\",\"~:key0045\",\"~:key0046\",\"~:key0047\",\"~:key0048\",\"~:key0049\",\"~:key0050\",\"~:key0051\",\"~:key0052\",\"~:key0053\",\"~:key0054\",\"~:key0055\",\"~:key0056\",\"~:key0057\",\"~:key0058\",\"~:key0059\",\"~:key0060\",\"~:key0061\",\"~:key0062\",\"~:key0063\",\"~:key0064\",\"~:key0065\",\"~:key0066\",\"~:key0067\",\"~:key0068\",\"~:key0069\",\"~:key0070\",\"~:key0071\",\"~:key0072\",\"~:key0073\",\"~:key0074\",\"~:key0075\",\"~:key0076\",\"~:key0077\",\"~:key0078\",\"~:key0079\",\"~:key0080\",\"~:key0081\",\"~:key0082\",\"~:key0083\",\"~:key0084\",\"~:key0085\",\"~:key0086\",\"~:key0087\",\"~:key0088\",\"~:key0089\",\"~:key0090\",\"~:key0091\",\"~:key0092\",\"~:key0093\",\"~:key0094\",\"^0\",\"^1\",\"^2\",\"^3\",\"^4\",\"^5\",\"^6\",\"^7\",\"^8\",\"^9\",\"^:\",\"^;\",\"^<\",\"^=\",\"^>\",\"^?\",\"^@\",\"^A\",\"^B\",\"^C\",\"^D\",\"^E\",\"^F\",\"^G\",\"^H\",\"^I\",\"^J\",\"^K\",\"^L\",\"^M\",\"^N\",\"^O\",\"^P\",\"^Q\",\"^R\",\"^S\",\"^T\",\"^U\",\"^V\",\"^W\",\"^X\",\"^Y\",\"^Z\",\"^[\",\"^10\",\"^11\",\"^12\",\"^13\",\"^14\",\"^15\",\"^16\",\"^17\",\"^18\",\"^19\",\"^1:\",\"^1;\",\"^1<\",\"^1=\",\"^1>\",\"^1?\",\"^1@\",\"^1A\",\"^1B\",\"^1C\",\"^1D\",\"^1E\",\"^1F\",\"^1G\",\"^1H\",\"^1I\",\"^1J\",\"^1K\",\"^1L\",\"^1M\",\"^1N\",\"^1O\",\"^1P\",\"^1Q\",\"^1R\",\"^1S\",\"^1T\",\"^1U\",\"^1V\",\"^1W\",\"^1X\",\"^1Y\",\"^1Z\",\"^1[\",\"^20\",\"^21\",\"^22\",\"^23\",\"^24\",\"^25\",\"^26\"]"),
                         "[\"~:key0000\",\"~:key0001\",\"~:key0002\",\"~:key0003\",\"~:key0004\",\"~:key0005\",\"~:key0006\",\"~:key0007\",\"~:key0008\",\"~:key0009\",\"~:key0010\",\"~:key0011\",\"~:key0012\",\"~:key0013\",\"~:key0014\",\"~:key0015\",\"~:key0016\",\"~:key0017\",\"~:key0018\",\"~:key0019\",\"~:key0020\",\"~:key0021\",\"~:key0022\",\"~:key0023\",\"~:key0024\",\"~:key0025\",\"~:key0026\",\"~:key0027\",\"~:key0028\",\"~:key0029\",\"~:key0030\",\"~:key0031\",\"~:key0032\",\"~:key0033\",\"~:key0034\",\"~:key0035\",\"~:key0036\",\"~:key0037\",\"~:key0038\",\"~:key0039\",\"~:key0040\",\"~:key0041\",\"~:key0042\",\"~:key0043\",\"~:key0044\",\"~:key0045\",\"~:key0046\",\"~:key0047\",\"~:key0048\",\"~:key0049\",\"~:key0050\",\"~:key0051\",\"~:key0052\",\"~:key0053\",\"~:key0054\",\"~:key0055\",\"~:key0056\",\"~:key0057\",\"~:key0058\",\"~:key0059\",\"~:key0060\",\"~:key0061\",\"~:key0062\",\"~:key0063\",\"~:key0064\",\"~:key0065\",\"~:key0066\",\"~:key0067\",\"~:key0068\",\"~:key0069\",\"~:key0070\",\"~:key0071\",\"~:key0072\",\"~:key0073\",\"~:key0074\",\"~:key0075\",\"~:key0076\",\"~:key0077\",\"~:key0078\",\"~:key0079\",\"~:key0080\",\"~:key0081\",\"~:key0082\",\"~:key0083\",\"~:key0084\",\"~:key0085\",\"~:key0086\",\"~:key0087\",\"~:key0088\",\"~:key0089\",\"~:key0090\",\"~:key0091\",\"~:key0092\",\"~:key0093\",\"~:key0094\",\"^0\",\"^1\",\"^2\",\"^3\",\"^4\",\"^5\",\"^6\",\"^7\",\"^8\",\"^9\",\"^:\",\"^;\",\"^<\",\"^=\",\"^>\",\"^?\",\"^@\",\"^A\",\"^B\",\"^C\",\"^D\",\"^E\",\"^F\",\"^G\",\"^H\",\"^I\",\"^J\",\"^K\",\"^L\",\"^M\",\"^N\",\"^O\",\"^P\",\"^Q\",\"^R\",\"^S\",\"^T\",\"^U\",\"^V\",\"^W\",\"^X\",\"^Y\",\"^Z\",\"^[\",\"^10\",\"^11\",\"^12\",\"^13\",\"^14\",\"^15\",\"^16\",\"^17\",\"^18\",\"^19\",\"^1:\",\"^1;\",\"^1<\",\"^1=\",\"^1>\",\"^1?\",\"^1@\",\"^1A\",\"^1B\",\"^1C\",\"^1D\",\"^1E\",\"^1F\",\"^1G\",\"^1H\",\"^1I\",\"^1J\",\"^1K\",\"^1L\",\"^1M\",\"^1N\",\"^1O\",\"^1P\",\"^1Q\",\"^1R\",\"^1S\",\"^1T\",\"^1U\",\"^1V\",\"^1W\",\"^1X\",\"^1Y\",\"^1Z\",\"^1[\",\"^20\",\"^21\",\"^22\",\"^23\",\"^24\",\"^25\",\"^26\"]");

    test.done();
};

exports.testMapMarkerEdgeCase = function(test) {
    var w = transit.writer("json"),
        r = transit.reader("json");

    test.deepEqual(["^ "], (r.read(w.write(["^ "]))));

    test.done();
};

// =============================================================================
// Constructors & Predicates
// =============================================================================

exports.testConstructorsAndPredicates = function(test) {
    var t = transit;

    test.ok(t.isInteger(t.integer("9007199254740993")));
    test.ok(t.isUUID(t.uuid("2f9e540c-0591-eff5-4e77-267b2cb3951f")));
    test.ok(t.isBigInt(t.bigInt("1")));
    test.ok(t.isBigDec(t.bigDec("1.5")));
    test.ok(t.isKeyword(t.keyword("foo")));
    test.ok(t.isSymbol(t.symbol("foo")));
    test.ok(t.isBinary(t.binary("Zm9v")));
    test.ok(t.isURI(t.uri("http://foo.com")));
    test.ok(t.isMap(t.map()));
    test.ok(t.isSet(t.set()));
    test.ok(t.isQuoted(t.quoted(1)));
    test.ok(t.isTaggedValue(t.tagged("n", 1)));

    test.done();
};

exports.testIsInteger = function(test) {
    var t = transit;

    test.ok(t.isInteger(0))
    test.ok(t.isInteger(1));
    test.ok(!t.isInteger(1.5));
    test.ok(!t.isInteger(Infinity));
    test.ok(!t.isInteger(-Infinity));
    test.ok(!t.isInteger(NaN));
    test.ok(!t.isInteger("string"));
    test.ok(!t.isInteger([]));
    test.ok(!t.isInteger(new Date()));

    test.done();
};

// =============================================================================
// Custom tags
// =============================================================================

exports.testTag = function(test) {
    var Point2d = function(x, y) {
        this.x = x;
        this.y = y;
    };

    Point2d.prototype.transitTag = "point";

    var Point3d = function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    };

    Point3d.prototype.transitTag = "point";

    var w = transit.writer("json", {
        "handlers": transit.map([
            "point", transit.makeWriteHandler({
                tag: function(v) {
                    if(v instanceof Point2d) {
                        return "point/2d";
                    } else if(v instanceof Point3d) {
                        return "point/3d";
                    }
                },
                rep: function(v) {
                    if(v instanceof Point2d) {
                        return [v.x, v.y];
                    } else if(v instanceof Point3d){
                        return [v.x, v.y, v.z];
                    }
                },
                stringRep: function(v) {
                    return null;
                }
            })
        ])
    });

    test.equal(w.write([new Point2d(1.5,2.5), new Point3d(1.5,2.5,3.5)]),
               '[["~#point/2d",[1.5,2.5]],["~#point/3d",[1.5,2.5,3.5]]]');

    test.done();
};

// =============================================================================
// Default write handler
// =============================================================================

exports.testDefaultWriteHandler = function(test) {
    var Point = function(x, y) {
        this.x = x;
        this.y = y;
    };

    Point.prototype.transitRep = function() {
        return {
            tag: "point",
            x: this.x,
            y: this.y
        }
    };

    var DefaultHandler = transit.makeWriteHandler({
        tag: function(v, h) { return "unknown"; },
        rep: function(v, h) { return v.transitRep(); }
    });

    var w = transit.writer("json", {
        "handlers": transit.map([
            "default", DefaultHandler
        ])
    });

    test.equal(w.write(new Point(1.5,2.5)),
               "[\"~#unknown\",[\"^ \",\"tag\",\"point\",\"x\",1.5,\"y\",2.5]]");

    test.done();
};

// =============================================================================
// Special Double Values
// =============================================================================

exports.testReadSpecialDoubleValues = function(test) {
    var r = transit.reader();

    test.ok(isNaN(r.read("[\"~#'\",\"~zNaN\"]")));
    test.equal(r.read("[\"~#'\",\"~zINF\"]"), Infinity);
    test.equal(r.read("[\"~#'\",\"~z-INF\"]"), -Infinity);

    test.done();
};

exports.testWriteSpecialDoubleValues = function(test) {
    var w = transit.writer();

    test.equal(w.write(Infinity), "[\"~#'\",\"~zINF\"]")
    test.equal(w.write(-Infinity), "[\"~#'\",\"~z-INF\"]");
    test.equal(w.write(NaN), "[\"~#'\",\"~zNaN\"]");

    test.done();
};

// =============================================================================
// Map Not Found
// =============================================================================

exports.testMapGetNotFound = function(test) {
    var m = transit.map([
        "foo", 1,
        "bar", 2
    ]);

    test.equal(m.get("baz", "woz"), "woz");

    test.done();
};

// =============================================================================
// Functions as keys
// =============================================================================

exports.testFunctionsAsKeys = function(test) {
    var isEven = function(n) { return n % 2 == 0; },
        isOdd  = function(n) { return !isEven(n); },
        m      = transit.map([
            isEven, "isEven",
            isOdd, "isOdd"
        ]),
        s      = transit.set();

    test.equal(m.get(isEven), "isEven");
    test.equal(m.get(isOdd), "isOdd");

    var v0 = m["delete"](isEven);

    test.equals(v0, "isEven");
    test.equals(m.get(isEven, "removed"), "removed");

    s.add(isEven);
    s.add(isOdd);

    test.equal(s.size, 2);
    test.ok(s.has(isEven));
    test.ok(s.has(isOdd));

    var v1 = s["delete"](isEven);

    test.equals(v1, isEven);
    test.ok(!s.has(isEven));

    test.done();
};

// =============================================================================
// Recursive asMapKey
// =============================================================================

exports.testRecursiveAsMapKey = function(test) {
    var r = transit.reader("json"),
        expected = transit.map(["cached", 0, transit.symbol("Explain"), "cached"]);

    test.ok(transit.equals(r.read("[\"^ \",[\"~#'\",\"cached\"],0,\"~$Explain\",\"^0\"]"),
                           expected));

    test.done();
};

// =============================================================================
// Binary Data
// =============================================================================

exports.testBinaryData = function(test) {
    var s  = "[\"~#\'\",\"~bc3VyZS4=\"]",
        r0 = transit.reader("json"),
        r1 = transit.reader("json", {preferBuffers: false}),
        w  = transit.writer("json");
    test.ok(r0.read(s) instanceof Buffer);
    test.ok(transit.isBinary(r0.read(s)));
    test.equal(w.write(r0.read(s)), "[\"~#\'\",\"~bc3VyZS4=\"]");
    test.ok(r1.read(s) instanceof Uint8Array);
    test.ok(transit.isBinary(r1.read(s)));
    test.equal(w.write(r1.read(s)), "[\"~#\'\",\"~bc3VyZS4=\"]");
    test.done();
};

// =============================================================================
// Cloning
// =============================================================================

exports.testMapClone = function(test) {
    var m0 = transit.map(["foo", 1, "bar", 2]),
        m1 = m0.clone();

    test.ok(transit.equals(m0, m1), "Cloned map equals original map");

    test.done();
};

exports.testSetClone = function(test) {
    var s0 = transit.set("foo", "bar", 1),
        s1 = transit.set("foo", "bar", 1);

    test.ok(transit.equals(s0, s1.clone()));

    test.done();
};

// =============================================================================
// Tagged Values
// =============================================================================

exports.testList = function(test) {
    test.ok(transit.isList(transit.list([1,2,3])));
    test.done();
};

// =============================================================================
// Map & Set Printing
// =============================================================================

exports.testPrintMap = function(test) {
    var m0 = transit.map([
        "foo", 1,
        "bar", 2,
        "baz", 3
    ]);

    test.ok(m0.toString() == "TransitMap {\"foo\" => 1, \"bar\" => 2, \"baz\" => 3}");

    var m1 = transit.map([
       "foo", null
    ]);

    test.ok(m1.toString() == "TransitMap {\"foo\" => null}");

    var m2 = transit.map([
        "foo", [1, 2, 3]
    ]);

    test.ok(m2.toString() == "TransitMap {\"foo\" => [1,2,3]}");

    test.done();
};

exports.testPrintSet = function(test) {
    var s0 = transit.set(["foo", "bar", "baz"]);

    test.ok(s0.toString() == "TransitSet {\"foo\", \"bar\", \"baz\"}");

    var s1 = transit.set([null]);

    test.ok(s1.toString() == "TransitSet {null}");

    var s2 = transit.set([[1,2,3]]);

    test.ok(s2.toString() == "TransitSet {[1,2,3]}");

    test.done();
};

// =============================================================================
// Tickets
// =============================================================================

// TJS-22
exports.testUndefinedHandlerKey = function(test) {
    try {
        var foo  = {},
            wrtr = transit.writer("json-verbose", {
                handlers: transit.map([
                    foo.bar, foo
                ])
            });
    } catch(e) {
        test.equal(e.message, "Cannot create handler for JavaScript undefined");
        test.done();
    }
};

// TJS-34

exports.testIterable = function(test) {
    var m = transit.map(["foo", 1, "bar", 2]),
        s = transit.set(["foo", "bar"]);

    if(Array.from) {
        var a0 = Array.from(m),
            a1 = Array.from(m.entries()),
            a2 = Array.from(m.keys()),
            a3 = Array.from(m.values());

        test.ok(a0.length == 2);
        test.ok(transit.equals([["foo", 1],["bar", 2]], a0) ||
                transit.equals([["bar", 2],["foo", 1]], a0));

        test.ok(a1.length == 2);
        test.ok(transit.equals([["foo", 1],["bar", 2]], a1) ||
                transit.equals([["bar", 2],["foo", 1]], a1));

        test.ok(a2.length == 2);
        test.ok(transit.equals(["foo", "bar"], a2) ||
                transit.equals(["bar", "foo"], a2));

        test.ok(a3.length == 2);
        test.ok(transit.equals([1, 2], a3) ||
                transit.equals([2, 1], a3));

        var a4 = Array.from(s),
            a5 = Array.from(s.entries()),
            a6 = Array.from(s.values());

        test.ok(a4.length == 2);
        test.ok(transit.equals(["foo", "bar"], a4) ||
                transit.equals(["bar", "foo"], a4));

        test.ok(a5.length == 2);
        test.ok(transit.equals([["foo", "foo"],["bar", "bar"]], a5) ||
                transit.equals([["bar", "bar"],["foo", "foo"]], a5));

        test.ok(a6.length == 2);
        test.ok(transit.equals(["foo", "bar"], a6) ||
                transit.equals(["bar", "foo"], a));
    } else {
        test.ok(true);
    }

    test.done();
};

//
exports.testBadCache = function(test) {
    var t = transit,
        pathological = [t.map([t.keyword("any-value"), t.map([["this array makes this a cmap"], "any value"]),
                               "any string", t.keyword("victim")]),
                        t.map([t.keyword("victim"), t.keyword("any-other-value")])],
        w = t.writer("json");

    console.log(w.write(pathological));

    test.done();
};