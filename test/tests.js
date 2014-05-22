// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var transit = require("../target/transit.js");

// =============================================================================
// Equality & Hashing
// =============================================================================

exports.testEquality = function(test) {

    test.ok(transit.equals(1, 1));
    test.ok(!transit.equals(1, 2));
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

    //test.ok(transit.equals(o1, o2));

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

    return test.done();
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

// =============================================================================
// API
// =============================================================================

exports.testWrite = function(test) {
    var writer = transit.writer("json");
    test.equal(writer.write({foo:"bar"}), "{\"foo\":\"bar\"}");
    test.done();
};

exports.testRead = function(test) {
    var reader = transit.reader("json");
    test.deepEqual(reader.read("{\"foo\":\"bar\"}"), {foo:"bar"});
    test.done();
};

exports.testReadTransitTypes = function(test) {
    var reader = transit.reader("json");

    test.deepEqual(reader.read("{\"~:foo\":\"bar\"}"), {"`~:foo":"bar"});
    test.deepEqual(reader.read("{\"~#ints\":[1,2,3]}"), [1,2,3]);
    test.deepEqual(reader.read("{\"~#longs\":[1,2,3]}"), [1,2,3]);
    test.deepEqual(reader.read("{\"~#floats\":[1.5,2.5,3.5]}"), [1.5,2.5,3.5]);
    test.deepEqual(reader.read("{\"~#doubles\":[1.5,2.5,3.5]}"), [1.5,2.5,3.5]);
    test.deepEqual(reader.read("{\"~#bools\":[\"~?t\",\"~?f\",\"~?t\"]}"), [true,false,true]);

    test.done();
};

exports.testWriteTransitTypes = function(test) {
    var writer = transit.writer("json");
    
    test.equal(writer.write(["foo"]), "[\"foo\"]");
    test.equal(writer.write([1]), "[1]");
    test.equal(writer.write([transit.integer("9007199254740993")]), "[\"~i9007199254740993\"]");
    test.equal(writer.write([transit.integer("-9007199254740993")]), "[\"~i-9007199254740993\"]");
    test.equal(writer.write([1.5]), "[1.5]");
    test.equal(writer.write([true]), "[true]");
    test.equal(writer.write([false]), "[false]");
    test.equal(writer.write([transit.keyword("foo")]), "[\"~:foo\"]");
    test.equal(writer.write([transit.symbol("foo")]), "[\"~$foo\"]");
    test.equal(writer.write([transit.date(482196050052)]), "[\"~t1985-04-12T23:20:50.052Z\"]");
    test.equal(writer.write([transit.keyword("foo"),transit.symbol("bar")]), "[\"~:foo\",\"~$bar\"]");
    test.equal(writer.write([transit.symbol("foo"),transit.keyword("bar")]), "[\"~$foo\",\"~:bar\"]");
    test.equal(writer.write([transit.uri("http://foo.com/")]), "[\"~rhttp://foo.com/\"]");
    test.equal(writer.write(transit.list([1,2,3])), "{\"~#list\":[1,2,3]}");
    test.equal(writer.write([transit.list([1,2,3])]), "[{\"~#list\":[1,2,3]}]");
    test.equal(writer.write(transit.uuid("531a379e-31bb-4ce1-8690-158dceb64be6")), "{\"~#\'\":\"~u531a379e-31bb-4ce1-8690-158dceb64be6\"}");
    test.equal(writer.write([transit.uuid("531a379e-31bb-4ce1-8690-158dceb64be6")]), "[\"~u531a379e-31bb-4ce1-8690-158dceb64be6\"]");
    test.equal(writer.write([transit.binary("c3VyZS4=")]), "[\"~bc3VyZS4=\"]");
    
    test.done();
};

exports.testWriteTransitComplexTypes = function(test) {
    var writer = transit.writer("json"),
        s0     = transit.set(["foo","bar","baz"]),
        m0     = transit.map(["foo","bar","baz","woz"]);
    test.equal(writer.write(s0),"{\"~#set\":[\"foo\",\"bar\",\"baz\"]}");
    test.done();
}; 

exports.testRoundtrip = function(test) {
    var writer = transit.writer("json"),
        s      = "{\"~#set\":[\"foo\",\"bar\",\"baz\"]}",
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
    test.equal(writer.write([{foo:[1,2]}]), "[{\"foo\":[1,2]}]");
    test.equal(writer.write([{foo:[1,2,{}]}]), "[{\"foo\":[1,2,{}]}]");
    test.equal(writer.write({foo:{bar:1,noz:3},baz:{woz:2,goz:4}}), "{\"foo\":{\"bar\":1,\"noz\":3},\"baz\":{\"woz\":2,\"goz\":4}}");

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
    test.equal(roundtrip("[\"~:foo\",\"~:bar\",{\"^\\\"\":[1,2]}]"), "[\"~:foo\",\"~:bar\",{\"^\\\"\":[1,2]}]");
    test.done();
};

exports.testVerifyJSONCornerCases = function(test) {
    test.equal(roundtrip("{\"~#point\":[1,2]}"), "{\"~#point\":[1,2]}");
    test.equal(roundtrip("{\"foo\":\"~xfoo\"}"), "{\"foo\":\"~xfoo\"}");
    test.equal(roundtrip("{\"~/t\":null}"), "{\"~/t\":null}");
    test.equal(roundtrip("{\"~/f\":null}"), "{\"~/f\":null}");
    test.equal(roundtrip("{\"~#'\":\"~f-1.1E-1\"}"), "{\"~#\'\":\"~f-1.1E-1\"}");
    test.equal(roundtrip("{\"~#'\":\"~f-1.10E-1\"}"), "{\"~#\'\":\"~f-1.10E-1\"}");
    test.equal(roundtrip(
                "{\"~#set\":[{\"~#ratio\":[\"~i4953778853208128465\",\"~i636801457410081246\"]},{\"^\\\"\":[\"~i-8516423834113052903\",\"~i5889347882583416451\"]}]}"),
                "{\"~#set\":[{\"~#ratio\":[\"~i4953778853208128465\",\"~i636801457410081246\"]},{\"^\\\"\":[\"~i-8516423834113052903\",\"~i5889347882583416451\"]}]}");

    test.done();
};

exports.testVerifyRoundtripCmap = function(test) {
    test.equal(roundtrip("{\"~#cmap\":[[2,2],\"two\",[1,1],\"one\"]}"), "{\"~#cmap\":[[2,2],\"two\",[1,1],\"one\"]}");
    test.done();
};

exports.testVerifyRoundtripMapCachedStrings = function(test) {
    test.equal(roundtrip("[{\"aaaa\":1,\"bbbb\":2},{\"^!\":3,\"^\\\"\":4},{\"^!\":5,\"^\\\"\":6}]"),
                         "[{\"aaaa\":1,\"bbbb\":2},{\"^!\":3,\"^\\\"\":4},{\"^!\":5,\"^\\\"\":6}]");
    test.done();
};

exports.testVerifyRoundtripEmptyString = function(test) {
    test.equal(roundtrip("[\"\",\"a\",\"ab\",\"abc\",\"abcd\",\"abcde\",\"abcdef\"]"),
                         "[\"\",\"a\",\"ab\",\"abc\",\"abcd\",\"abcde\",\"abcdef\"]");
    test.done();
};

exports.testVerifyRoundtripLong = function(test) {
    test.equal(roundtrip("{\"~#'\":\"~i8987676543234565432178765987645654323456554331234566789\"}"),
                         "{\"~#'\":\"~i8987676543234565432178765987645654323456554331234566789\"}");
    test.done();
};

