// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var url     = require("url"),
    Long    = require("long"),
    transit = require("../src/transit.js"),
    h       = require("../src/transit/handlers.js"),
    w       = require("../src/transit/writer.js"),
    d       = require("../src/transit/decoder.js"),
    t       = require("../src/transit/types.js"),
    eq      = require("../src/transit/eq.js"),
    wr      = require("../src/transit/writer.js"),
    sb      = require("../src/transit/stringbuilder.js"),
    caching = require("../src/transit/caching.js");

// =============================================================================
// Equality & Hashing
// =============================================================================

exports.testEquality = function(test) {

    test.ok(eq.equals(1, 1));
    test.ok(!eq.equals(1, 2));
    test.ok(eq.equals("foo", "foo"));
    test.ok(!eq.equals("foo", "bar"));
    test.ok(eq.equals([], []));
    test.ok(eq.equals([1,2,3], [1,2,3]));
    test.ok(!eq.equals([2,2,3], [1,2,3]));
    test.ok(eq.equals([1,[2,3],4], [1,[2,3],4]));
    test.ok(!eq.equals([1,[3,3],4], [1,[2,3],4]));
    test.ok(!eq.equals([1,2,3], {}));
    test.ok(eq.equals({}, {}));
    test.ok(eq.equals({foo: "bar"}, {foo: "bar"}));
    test.ok(!eq.equals({foo: "bar", baz: "woz"}, {foo: "bar"}));
    test.ok(!eq.equals({foo: "bar"}, {foo: "baz"}));
    test.ok(eq.equals(t.date(1399471321791), t.date(1399471321791)));
    test.ok(!eq.equals(t.date(1399471321791), t.date(1399471321792)));

    var o  = {foo: "bar", baz: "woz"},
        hc = eq.hashCode(o);

    test.ok(eq.equals(o, {foo: "bar", baz: "woz"}));

    var o1  = {foo: "bar", baz: "woz"},
        hc1 = eq.hashCode(o1),
        o2  = {foo: "bar", baz: "woz"},
        hc2 = eq.hashCode(o2);

    test.ok(eq.equals(o1, o2));

    test.done();
};

exports.testEqualitySymbolsAndKeywords = function(test) {

    var k0 = t.Keyword("foo"),
        k1 = t.Keyword("foo"),
        k2 = t.Keyword("bar"),
        s0 = t.Symbol("foo"),
        s1 = t.Symbol("foo"),
        s2 = t.Symbol("bar");

    test.ok(eq.equals(k0, k1));
    test.ok(eq.equals(k0, k2));
    test.ok(eq.equals(s0, s1));
    test.ok(eq.equals(s0, s2));

    test.done();
};

exports.testHashCode = function(test) {

    test.equal(eq.hashCode("foo"), eq.hashCode("foo"));
    test.notEqual(eq.hashCode("foo"), eq.hashCode("fop"));
    test.equal(eq.hashCode([]), 0);
    test.equal(eq.hashCode([1,2,3]), eq.hashCode([1,2,3]));
    test.notEqual(eq.hashCode([1,2,3]), eq.hashCode([1,2,4]));
    test.equal(eq.hashCode({foo: "bar"}), eq.hashCode({foo: "bar"}));
    test.notEqual(eq.hashCode({foo: "bar"}), eq.hashCode({foo: "baz"}));
    test.equal(eq.hashCode({}), eq.hashCode({}));
    test.equal(eq.hashCode(new Date(2014,4,6)), eq.hashCode(new Date(2014,4,6)));

    test.done();
};

// =============================================================================
// TransitMap
// =============================================================================

exports.testTransitMapBasic = function(test) {

    var m0 = t.map([]);

    test.ok(m0.size == 0);

    var m1 = t.map(["foo", "bar"]);

    test.ok(m1.size == 1);
    test.ok(m1.has("foo"));
    test.equal(m1.get("foo"), "bar");

    var m2 = t.map(["foo", "bar", 101574, "baz"]);

    test.ok(m2.size == 2);
    test.ok(m2.has("foo") && m2.has(101574));
    test.ok((m2.get("foo") == "bar") && (m2.get(101574) == "baz"));

    var m3 = t.map(["foo", "bar"]);

    test.equal(eq.hashCode(m1), eq.hashCode(m3));

    var m4 = t.map(["foo", "bop"]);

    test.notEqual(eq.hashCode(m3), eq.hashCode(m4));

    var m5 = t.map([[1,2], "foo", [3,4], "bar"]);

    test.ok(m5.get([1,2]) === "foo" && (m5.get([3,4]) === "bar"));

    var m5 = t.map(["foo", "bar", "foo", "baz"]);

    test.equal(m5.size, 1);
    test.equal(m5.get("foo"), "baz");

    var m6 = t.map(["foo", "bar", "baz", "woz"]),
        m7 = t.map(["foo", "bar", "baz", "woz"]),
        m8 = t.map(["baz", "woz", "foo", "bar"]);

    test.ok(eq.equals(m6,m7));
    test.ok(eq.equals(m7,m8))

    return test.done();
};

// =============================================================================
// TransitSet
// =============================================================================

exports.testTransitSetBasic = function(test) {
    var s0 = t.set([]);

    test.equal(s0.size, 0);

    var s1 = t.set([1]);

    test.equal(s1.size, 1);

    var s2 = t.set([1,1,2]);

    test.equal(s2.size, 2);

    var s3 = t.set(["foo","bar","baz"]);
    test.ok(s3.has("foo") && s3.has("bar"), s3.has("baz"));

    var s4 = t.set(["baz","bar","foo"]);
    test.ok(eq.equals(s3,s4));

    var s5 = t.set(["foo",1,"bar",[1,2]]);
    test.ok(s5.has("bar"));

    test.done();
}


// =============================================================================
// Decoding
// =============================================================================

// -----------------------------------------------------------------------------
// Implementation Tests

exports.testIsCacheable = function(test) {
    test.ok(caching.isCacheable("~:f", false) === false);
    test.ok(caching.isCacheable("~:f", true) === false);
    test.ok(caching.isCacheable("~:foobar", false) === true);
    test.ok(caching.isCacheable("~$foobar", false) === true);
    test.ok(caching.isCacheable("~#foobar", false) === true);
    test.ok(caching.isCacheable("~foobar", false) === false);
    test.done();
};

exports.testWriteCacheWrite = function(test) {
    var cache = caching.writeCache();
    cache.write("~:foobar", false);
    test.deepEqual(cache.cache, {"~:foobar":"^!"});
    test.done();
};

exports.testIsCacheCode = function(test) {
    test.ok(caching.isCacheCode("^!"));
    test.done();
};

exports.testReadCacheWrite = function(test) {
    var cache = caching.readCache();
    cache.write("~:foo", "foo");
    test.ok(cache.cache.length == caching.MAX_CACHE_ENTRIES);
    test.ok(cache.idx == 1);
    test.done();
};

exports.testReadCacheRead = function(test) {
    var cache = caching.readCache();
    cache.write("~:foo", "foo");
    test.ok(cache.read("^!") == "foo");
    test.done();
};

exports.testDecoderGetDecoder = function(test) {
    var dc = d.decoder();
    test.ok(dc.getDecoder(":")("foo").name == "foo");
    test.ok(dc.getDecoder("i")("1") == 1);
    test.ok(dc.getDecoder("f")("1.5").value == "1.5");
    test.done();
};

// -----------------------------------------------------------------------------
// Decoding

exports.testDecodeBasic = function(test) {
    var dc = d.decoder();

    test.ok(dc.decode(null) === null);
    test.ok(dc.decode(true) === true);
    test.ok(dc.decode(false) === false);
    test.ok(dc.decode(10) === 10);
    test.ok(dc.decode(1.5) === 1.5);
    test.ok(dc.decode("foo") === "foo");
    test.ok(dc.decode("~_") === null);
    test.ok(dc.decode("~?t") === true);
    test.ok(dc.decode("~?f") === false);
    test.ok(dc.decode("~i10") == 10);
    test.ok(dc.decode("~f1.5").value === "1.5");
    test.ok(dc.decode("~d1.5") === 1.5);
    test.ok(dc.decode("~ca") === "a");
    test.ok(dc.decode("~~foo") === "~foo");
    test.deepEqual(dc.decode([]), []);
    test.deepEqual(dc.decode([1,2,3]), [1,2,3]);
    
    var uuid = dc.decode("~u531a379e-31bb-4ce1-8690-158dceb64be6");

    test.ok(uuid instanceof t.UUID);
    test.ok(uuid.str === "531a379e-31bb-4ce1-8690-158dceb64be6");

    var uri = dc.decode("~rhttp://foo.com");

    test.ok(uri instanceof url.Url);
    test.ok(uri.href === "http://foo.com/");

    test.done();
};

exports.testDecodeMaps = function(test) {
    var dc = d.decoder();

    test.deepEqual(dc.decode({a: 1}), {a: 1});
    test.deepEqual(dc.decode({a: 1, b: 2}), {a: 1, b: 2});
    test.deepEqual(dc.decode({a: 1, b: "~d1.5"}), {a: 1, b: 1.5});

    // we do not convert keys of objects
    test.deepEqual(dc.decode({"~~a": 1}), {"~a": 1});
    test.ok(eq.equals(dc.decode({"~t1985-04-12T23:20:50.052Z": "~t1985-04-12T23:20:50.052Z"}),
                                {"`~t1985-04-12T23:20:50.052Z": t.date(482196050052)}));

    test.done();
}

exports.testDefaultStringDecoder = function(test) {
    var dc = d.decoder(),
        v  = dc.decode("~xfoo");
    test.ok(dc.decode("~xfoo") === "`~xfoo");
    test.done();
};

// exports.testDecodeIdentity = function(test) {
//   var dc = d.decoder(),
//       v  = dc.decode("~#'foo");
//   test.ok(v === "foo", "decoding \"~#'foo\" returns \"foo\"");
//   test.done();
// }

exports.testDecodeSymbol = function(test) {
    var dc = d.decoder(),
        v  = dc.decode("~$foo");
    test.ok(v instanceof t.Symbol);
    test.ok(v.name === "foo");
    test.done();
};

exports.testDecodeKeyword = function(test) {
    var dc = d.decoder(),
        v  = dc.decode("~:foo");
    test.ok(v instanceof t.Keyword);
    test.ok(v.name === "foo");
    test.done();
};

exports.testDecodeArrayOfKeywords = function(test) {
    var dc = d.decoder(),
        v  = dc.decode(["~:foo", "~:bar", "~:baz"]);
    test.ok(v.length === 3);
    test.ok(v[0] instanceof t.Keyword);
    test.ok(v[2].name === "baz");
    test.done();
};

/*
exports.testDecodeSetOfKeywords = function(test) {
  var dc = d.decoder(),
      v  = dc.decode({"~#set": ["~:foo", "~:bar", "~:baz"]});
  test.ok(v instanceof t.Set, "Decoding a set of keywords produces a Set");
  test.ok(v.size === 3, "Decoding a set of keywords returns a Set of the same size");
  test.done();
};
*/

// dates
exports.testDecodeDates = function(test) {
    var dc = d.decoder(),
        v  = dc.decode("~t1985-04-12T23:20:50.052Z");
    test.ok(v instanceof Date);
    test.ok(v.valueOf() === (new Date(Date.UTC(1985,3,12,23,20,50,52))).valueOf());
    test.done();
};

// typed arrays
// lists

/*
exports.testDecodeCMaps = function(test) {
  var dc = d.decoder(),
      v  = dc.decode({"~#cmap": ["foo", "a", "bar", "b"]});

  test.ok(v instanceof t.Map, "decoding a cmap returns a Map instance");
  test.ok(v.size === 2, "decoding a cmap returns a Map instance of expected size");
  test.ok(v.get("foo") === "a" && v.get("bar") === "b", "decoding a cmap returns expected Map instace");

  var c  = caching.readCache(),
      v1 = dc.decode({"~#cmap": ["~:foo", "a", "~:bar", "b"]}, c),
      k1 = dc.decode("^!", c);

  test.ok(v1.get(k1) === "a", "cmap supports keyword keys");

  test.done();
}
*/

exports.testDecodeTaggedValue = function(test) {
    var dc = d.decoder(),
        v  = dc.decode({"~#widget": ["~:foo", "~:bar", "~:baz"]});
    test.ok(v.constructor === t.TaggedValue);
    test.ok(v.tag === "widget");
    test.ok(v.rep.length === 3);
    test.ok(v.rep[0] instanceof t.Keyword);
    test.done();
};

// overrides

// caching

exports.testDecodeReadCache = function(test) {
    var dc = d.decoder(),
        c  = caching.readCache(),
        v  = dc.decode(["~:foo", "^!", "~:bar", "^\""], c, false);
    test.ok(v[0] === v[1] && v[2] === v[3]);
    test.done();
};

// edge cases

// =============================================================================
// Encoding
// =============================================================================

exports.testDefaultHandlers = function(test) {
    var em = new wr.JSONMarshaller(),
        c  = caching.writeCache();

    var h0 = em.handler(1),
        h1 = em.handler(true),
        h2 = em.handler(false),
        h3 = em.handler(null),
        h4 = em.handler([]),
        h5 = em.handler({});

    test.equal(h0.tag(1), "i");
    test.equal(h1.tag(true), "?");
    test.equal(h2.tag(false), "?");
    test.equal(h3.tag(null), "_");
    test.equal(h4.tag([]), "array");
    test.equal(h5.tag({}), "map");

    test.done();
};

exports.testWriterMarshalling = function(test) {
    var em = new wr.JSONMarshaller(),
        c  = caching.writeCache();

    test.equal(wr.marshal(em, null, false, c), null);
    test.equal(wr.marshal(em, true, false, c), true);
    test.equal(wr.marshal(em, false, false, c), false);
    test.equal(wr.marshal(em, 1, false, c), 1);
    test.equal(wr.marshal(em, 1.5, false, c), 1.5);
    test.equal(wr.marshal(em, "foo", false, c), "foo");
    test.deepEqual(wr.marshal(em, [1,2,3], false, c), [1,2,3]);
    test.deepEqual(wr.marshal(em, {foo: "bar"}, false, c), {"foo":"bar"});
    test.deepEqual(wr.marshal(em, [1,[2,3],4], false, c), [1,[2,3],4]);
    test.deepEqual(wr.marshal(em, {foo:[1,2,3]}, false, c), {"foo":[1,2,3]});
    test.deepEqual(wr.marshal(em, {foo:[1,{bar:2},3]}, false, c), {"foo":[1,{"bar":2},3]});
    test.deepEqual(wr.marshal(em, {foo:1,bar:2}, false, c), {"foo":1,"bar":2});
    
    test.done();
};

exports.testHandlerTypeTag = function(test) {
    test.equal(h.typeTag(Date),h.typeTag(Date));
    test.done();
};

exports.testWriterEmitTaggedMap = function(test) {
    var em = new wr.JSONMarshaller({prefersStrings: false}),
        c  = caching.writeCache(),
        d  = (new Date(Date.UTC(1985,3,12,23,20,50,52))),
        h  = em.handler(d);

    test.deepEqual(wr.emitTaggedMap(em, "t", h.rep(d), false, c), {"~#t":482196050052});
    test.deepEqual(wr.marshal(em, d, false, c), {"~#t":482196050052});

    test.done();
};

exports.testWriterEmitQuoted = function(test) {
    var em = new wr.JSONMarshaller(),
        c  = caching.writeCache();

    test.deepEqual(em.emitQuoted(1, c), {"~#\'":1});

    test.done();
};

exports.testWriterMarshalTop = function(test) {
    var em = new wr.JSONMarshaller(),
        c  = caching.writeCache(),
        d  = (new Date(Date.UTC(1985,3,12,23,20,50,52)))

    test.deepEqual(wr.marshalTop(em, 1, c), "{\"~#\'\":1}");
    test.deepEqual(wr.marshalTop(em, {foo:"bar"}, c), "{\"foo\":\"bar\"}");
    test.deepEqual(wr.marshalTop(em, [1,2,3], c), "[1,2,3]");
    test.deepEqual(wr.marshalTop(em, {foo:d}, c), "{\"foo\":\"~t1985-04-12T23:20:50.052Z\"}");

    test.done();
};

exports.testWriterMarshalTopPreferStringsFalse = function(test) {
    var em = new wr.JSONMarshaller({prefersStrings:false}),
        c  = caching.writeCache(),
        d  = (new Date(Date.UTC(1985,3,12,23,20,50,52)))

    test.equal(wr.marshalTop(em, {foo:d}, c), "{\"foo\":{\"~#t\":482196050052}}");

    test.done();
};

// =============================================================================
// Queue
// =============================================================================

exports.testQueue = function(test) {
    var q = t.queue();

    q.push(1);
    test.equal(q.peek(), 1);
    q.push(2);
    test.equal(q.peek(), 2);
    q.push(3);
    test.equal(q.peek(), 3);
    q.pop();
    test.equal(q.peek(), 2);
    q.pop();
    test.equal(q.peek(), 1);
    q.pop();
    test.equal(q.peek(), null);

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
    test.equal(writer.write([w.JSON_INT_MAX.add(Long.fromInt(1))]), "[\"~i9007199254740993\"]");
    test.equal(writer.write([w.JSON_INT_MIN.subtract(Long.fromInt(1))]), "[\"~i-9007199254740993\"]");
    test.equal(writer.write([1.5]), "[1.5]");
    test.equal(writer.write([true]), "[true]");
    test.equal(writer.write([false]), "[false]");
    test.equal(writer.write([t.keyword("foo")]), "[\"~:foo\"]");
    test.equal(writer.write([t.symbol("foo")]), "[\"~$foo\"]");
    test.equal(writer.write([t.date(482196050052)]), "[\"~t1985-04-12T23:20:50.052Z\"]");
    test.equal(writer.write([t.keyword("foo"),t.symbol("bar")]), "[\"~:foo\",\"~$bar\"]");
    test.equal(writer.write([t.symbol("foo"),t.keyword("bar")]), "[\"~$foo\",\"~:bar\"]");
    test.equal(writer.write([t.uri("http://foo.com/")]), "[\"~rhttp://foo.com/\"]");
    test.equal(writer.write(t.list([1,2,3])), "{\"~#list\":[1,2,3]}");
    test.equal(writer.write([t.list([1,2,3])]), "[{\"~#list\":[1,2,3]}]");
    test.equal(writer.write(t.uuid("531a379e-31bb-4ce1-8690-158dceb64be6")), "{\"~#\'\":\"~u531a379e-31bb-4ce1-8690-158dceb64be6\"}");
    test.equal(writer.write([t.uuid("531a379e-31bb-4ce1-8690-158dceb64be6")]), "[\"~u531a379e-31bb-4ce1-8690-158dceb64be6\"]");
    test.equal(writer.write([t.binary("c3VyZS4=")]), "[\"~bc3VyZS4=\"]");
    
    test.done();
};

exports.testWriteTransitComplexTypes = function(test) {
    var writer = transit.writer("json"),
        s0     = t.set(["foo","bar","baz"]),
        m0     = t.map(["foo","bar","baz","woz"]);

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
    var x      = {"~:foo0": [t.keyword("bar"+0), 0],
                  "~:foo1": [t.keyword("bar"+1), 1]},
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

exports.testVerifyCaching = function(test) {
    var writer = transit.writer("json");

    test.done();
};

exports.testVerifyRoundTripCachedKeys = function(test) {
    var reader = transit.reader("json"),
        writer = transit.writer("json");

    test.equal(writer.write(reader.read("[\"~:foo\",\"~:bar\",{\"^\\\"\":[1,2]}]")), "[\"~:foo\",\"~:bar\",{\"^\\\"\":[1,2]}]");

    test.done();
};

exports.testVerifyJSONCornerCases = function(test) {

    var reader = transit.reader("json"),
        writer = transit.writer("json");

    test.equal(writer.write(reader.read("{\"~#point\":[1,2]}")), "{\"~#point\":[1,2]}");
    test.equal(writer.write(reader.read("{\"foo\":\"~xfoo\"}")), "{\"foo\":\"~xfoo\"}");
    test.equal(writer.write(reader.read("{\"~/t\":null}")), "{\"~/t\":null}");
    test.equal(writer.write(reader.read("{\"~/f\":null}")), "{\"~/f\":null}");
    test.equal(writer.write(reader.read("{\"~#'\":\"~f-1.1E-1\"}")), "{\"~#\'\":\"~f-1.1E-1\"}");
    test.equal(writer.write(reader.read("{\"~#'\":\"~f-1.10E-1\"}")), "{\"~#\'\":\"~f-1.10E-1\"}");
    test.equal(writer.write(reader.read(
                "{\"~#set\":[{\"~#ratio\":[\"~i4953778853208128465\",\"~i636801457410081246\"]},{\"^\\\"\":[\"~i-8516423834113052903\",\"~i5889347882583416451\"]}]}")),
                "{\"~#set\":[{\"~#ratio\":[\"~i4953778853208128465\",\"~i636801457410081246\"]},{\"^\\\"\":[\"~i-8516423834113052903\",\"~i5889347882583416451\"]}]}");

    test.done();
};
