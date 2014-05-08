// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var caching = require("../src/transit/caching.js"),
    w       = require("../src/transit/writer.js"),
    d       = require("../src/transit/decoder.js"),
    t       = require("../src/transit/types.js"),
    url     = require("url"),
    eq      = require("../src/transit/eq.js"),
    wr      = require("../src/transit/writer.js");

// =============================================================================
// Equality & Hashing
// =============================================================================

exports.testEquality = function(test) {

  test.ok(eq.equals(1, 1), "1 equals 1");
  test.ok(!eq.equals(1, 2), "1 does not equal 2");
  test.ok(eq.equals("foo", "foo"), "\"foo\" equals \"foo\"");
  test.ok(!eq.equals("foo", "bar"), "\"foo\" does not equal \"bar\"");
  test.ok(eq.equals([], []), "[]  equals []");
  test.ok(eq.equals([1,2,3], [1,2,3]), "[1,2,3] equals [1,2,3]");
  test.ok(!eq.equals([2,2,3], [1,2,3]), "[2,2,3] does not equal [1,2,3]");
  test.ok(eq.equals([1,[2,3],4], [1,[2,3],4]), "[1,[2,3],4] equals [1,[2,3],4]");
  test.ok(!eq.equals([1,[3,3],4], [1,[2,3],4]), "[1,[3,3],4] does not equal [1,[2,3],4]");
  test.ok(!eq.equals([1,2,3], {}), "[1,2,3] does not equal {}");
  test.ok(eq.equals({}, {}), "{} equals {}");
  test.ok(eq.equals({foo: "bar"}, {foo: "bar"}), "{foo: \"bar\"} equals {foo: \"bar\"}");
  test.ok(!eq.equals({foo: "bar", baz: "woz"}, {foo: "bar"}), "{foo: \"bar\", baz: \"woz\"} equals {foo: \"bar\"}");
  test.ok(!eq.equals({foo: "bar"}, {foo: "baz"}), "{foo: \"bar\"} does not equal {foo: \"baz\"}");
  test.ok(eq.equals(t.date(1399471321791), t.date(1399471321791)), "equivalent dates are always equal");
  test.ok(!eq.equals(t.date(1399471321791), t.date(1399471321792)), "different dates are never equal");

  var o  = {foo: "bar", baz: "woz"},
      hc = eq.hashCode(o);

  test.ok(eq.equals(o, {foo: "bar", baz: "woz"}), "{foo: \"bar\", baz: \"woz\"} instances equal even if hashCode added to one instance");

  var o1  = {foo: "bar", baz: "woz"},
      hc1 = eq.hashCode(o1),
      o2  = {foo: "bar", baz: "woz"},
      hc2 = eq.hashCode(o2);

  test.ok(eq.equals(o1, o2), "{foo: \"bar\", baz: \"woz\"} instances equal even if hashCode added to all instances");

  test.done();
};

exports.testEqualitySymbolsAndKeywords = function(test) {

  var k0 = t.Keyword("foo"),
      k1 = t.Keyword("foo"),
      k2 = t.Keyword("bar"),
      s0 = t.Symbol("foo"),
      s1 = t.Symbol("foo"),
      s2 = t.Symbol("bar");

  test.ok(eq.equals(k0, k1), "The same keywords are always equal");
  test.ok(eq.equals(k0, k2), "Different keywords are never equal");
  test.ok(eq.equals(s0, s1), "The same symbols are always equal");
  test.ok(eq.equals(s0, s2), "Different keywrods are never equal");

  test.done();
};

exports.testHashCode = function(test) {

  test.equal(eq.hashCode("foo"), eq.hashCode("foo"), "hash code for \"foo\" is always the same");
  test.notEqual(eq.hashCode("foo"), eq.hashCode("fop"), "hash code for \"foo\" is not same as \"fop\"");
  test.equal(eq.hashCode([]), 0, "hash code for [] is 0");
  test.equal(eq.hashCode([1,2,3]), eq.hashCode([1,2,3]), "hash code for [1,2,3] is always the same");
  test.notEqual(eq.hashCode([1,2,3]), eq.hashCode([1,2,4]), "hash code for [1,2,3] and [1,2,4] is differed");
  test.equal(eq.hashCode({foo: "bar"}), eq.hashCode({foo: "bar"}), "hash code for {foo: \"bar\"} is always the same");
  test.notEqual(eq.hashCode({foo: "bar"}), eq.hashCode({foo: "baz"}), "hash code for {foo: \"bar\"} and {foo: \"baz\" is not the same");
  test.equal(eq.hashCode({}), eq.hashCode({}), "hash code for {} is always the same");
  test.equal(eq.hashCode(new Date(2014,4,6)), eq.hashCode(new Date(2014,4,6)), "hash code for dates are always the same");

  test.done();
};

// =============================================================================
// TransitMap
// =============================================================================

exports.testTransitMapBasic = function(test) {

  var m0 = t.transitMap([]);

  test.ok(m0.size == 0, "Size of empty TransitMap is 0");

  var m1 = t.transitMap(["foo", "bar"]);

  test.ok(m1.size == 1, "Size of TransitMap from array of two elements is 1");
  test.ok(m1.has("foo"), "TransitMap has expected key");
  test.equal(m1.get("foo"), "bar", "Accessing key of TransitMap returns expected result");

  var m2 = t.transitMap(["foo", "bar", 101574, "baz"]);

  test.ok(m2.size == 2, "Size of TransitMap with collisions from array of two elements is 2");
  test.ok(m2.has("foo") && m2.has(101574), "TransitMap with collisions has expected keys");
  test.ok((m2.get("foo") == "bar") && (m2.get(101574) == "baz"), "Accessing keys of TransitMap with collisions returns expected result");

  var m3 = t.transitMap(["foo", "bar"]);

  test.equal(eq.hashCode(m1), eq.hashCode(m3), "hash codes for equivalent TransitMaps are always the same");

  var m4 = t.transitMap(["foo", "bop"]);

  test.notEqual(eq.hashCode(m3), eq.hashCode(m4), "TransmitMap({foo: \"bar\"}) and TransmitMap({foo: \"bop\") have different hash codes");

  var m5 = t.transitMap([[1,2], "foo", [3,4], "bar"]);

  test.ok(m5.get([1,2]) === "foo" && (m5.get([3,4]) === "bar"), "Can access complex keys from TransitMap");

  return test.done();
};

// =============================================================================
// Decoding
// =============================================================================

// -----------------------------------------------------------------------------
// Implementation Tests

exports.testIsCacheable = function(test) {
  test.ok(caching.isCacheable("~:f", false) === false, "\"~:f\" should not be cached");
  test.ok(caching.isCacheable("~:f", true) === false, "\"~:f\" with asMapKey true should be cached");
  test.ok(caching.isCacheable("~:foobar", false) === true, "\"~:foobar\" should be cached");
  test.ok(caching.isCacheable("~$foobar", false) === true, "\"~$foobar\" should be cached");
  test.ok(caching.isCacheable("~#foobar", false) === true, "\"#foobar\" should be cached");
  test.ok(caching.isCacheable("~foobar", false) === false, "\"~foobar\" should not be cached");
  test.done();
};

exports.testWriteCacheWrite = function(test) {
  var cache = caching.writeCache();
  cache.write("~:foobar", false);
  test.deepEqual(cache.cache, {"~:foobar":"^!"}, "First cache write should map to \"^!\"");
  test.done();
};

exports.testIsCacheCode = function(test) {
  test.ok(caching.isCacheCode("^!"), "\"^!\" is a cache code");
  test.done();
};

exports.testReadCacheWrite = function(test) {
  var cache = caching.readCache();
  cache.write("~:foo", "foo");
  test.ok(cache.cache.length == caching.MAX_CACHE_ENTRIES, "Read cache size does not exceed maximum");
  test.ok(cache.idx == 1, "Single read cache write bumps cache index");
  test.done();
};

exports.testReadCacheRead = function(test) {
  var cache = caching.readCache();
  cache.write("~:foo", "foo");
  test.ok(cache.read("^!") == "foo", "Single read cache read after cache write returns expected value");
  test.done();
};

exports.testDecoderGetDecoder = function(test) {
  var dc = d.decoder();
  test.ok(dc.getDecoder(":")("foo").name == "foo", "Can access symbol decoder and invoke");
  test.ok(dc.getDecoder("i")("1") == 1, "Can access integer decoder and invoke");
  test.ok(dc.getDecoder("f")("1.5") == 1.5, "Can access float decoder and invoke");
  test.done();
};

// -----------------------------------------------------------------------------
// Decoding

exports.testDecodeBasic = function(test) {
  var dc = d.decoder();

  test.ok(dc.decode(null) === null, "decoding null returns null");
  test.ok(dc.decode(true) === true, "decoding true returns true");
  test.ok(dc.decode(false) === false, "decoding false returns false");
  test.ok(dc.decode(10) === 10, "decoding 10 returns 10");
  test.ok(dc.decode(1.5) === 1.5, "decoding 1.5 returns 1.5");
  test.ok(dc.decode("foo") === "foo", "decoding \"foo\" returns \"foo\"");
  test.ok(dc.decode("~_") === null, "decoding \"~_\" returns null");
  test.ok(dc.decode("~?t") === true, "decoding \"~?t\" returns true");
  test.ok(dc.decode("~?f") === false, "decoding \"~?f\" returns false");
  test.ok(dc.decode("~i10") == 10, "decoding \"~i10\" returns value equal to 10");
  test.ok(dc.decode("~f1.5") === 1.5, "decoding \"~i1.5\" returns 1.5");
  test.ok(dc.decode("~d1.5") === 1.5, "decoding \"~d1.5\" returns 1.5");
  test.ok(dc.decode("~ca") === "a", "decoding \"~ca\" returns \"a\"");
  test.ok(dc.decode("~~foo") === "~foo", "decoding \"~~foo\" returns \"~foo\"");
  test.deepEqual(dc.decode([]), [], "decoding an empty array returns an empty array");
  test.deepEqual(dc.decode([1,2,3]), [1,2,3], "decoding an array returns an equal array");
  
  var uuid = dc.decode("~u531a379e-31bb-4ce1-8690-158dceb64be6");

  test.ok(uuid instanceof t.UUID, "decoding \"~uXXX\" returns a UUID");
  test.ok(uuid.str === "531a379e-31bb-4ce1-8690-158dceb64be6", "decoding \"~uXXX\" returns UUID with expected property");

  var uri = dc.decode("~rhttp://foo.com");

  test.ok(uri instanceof url.Url, "decoding \"~rhttp://foo.com\" returns Url instance");
  test.ok(uri.href === "http://foo.com/", "decoding \"~rhttp://foo.com\" returns expected Url instance");

  test.done();
};

exports.testDecodeMaps = function(test) {
  var dc = d.decoder();

  test.deepEqual(dc.decode({a: 1}), {a: 1}, "Decoding a simple map returns an equal map");
  test.deepEqual(dc.decode({a: 1, b: 2}), {a: 1, b: 2}, "Decoding a simple map with >1 KV pairs returns an equal map");
  test.deepEqual(dc.decode({a: 1, b: "~f1.5"}), {a: 1, b: 1.5}, "Decoding a simple map with >1 KV pairs with encoded value returns an equal map");

  // we do not convert keys of objects
  test.deepEqual(dc.decode({"~~a": 1}), {"~~a": 1}, "Decoding a simple map with escaped key returns same map");
  test.ok(eq.equals(dc.decode({"~t1985-04-12T23:20:50.052Z": "~t1985-04-12T23:20:50.052Z"}),
                              {"~t1985-04-12T23:20:50.052Z": t.date(482196050052)},
                    "Decoding a simple map with encoded date key and encoded date value returns expected map"));

  test.done();
}

exports.testDefaultStringDecoder = function(test) {
  var dc = d.decoder(),
      v  = dc.decode("~xfoo");
  test.ok(dc.decode("~xfoo") === "`~xfoo", "Decoding a string that cannot be decoded encodes it");
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
  test.ok(v instanceof t.Symbol, "~$foo is decoded into an instance of Symbol");
  test.ok(v.name === "foo", "~$foo is decoded into a Symbol with the right properties");
  test.done();
};

exports.testDecodeKeyword = function(test) {
  var dc = d.decoder(),
      v  = dc.decode("~:foo");
  test.ok(v instanceof t.Keyword, "~:foo is decoded into an instance of Keyword");
  test.ok(v.name === "foo", "~:foo is decoded into a Keyword with the right properties");
  test.done();
};

exports.testDecodeArrayOfKeywords = function(test) {
  var dc = d.decoder(),
      v  = dc.decode(["~:foo", "~:bar", "~:baz"]);
  test.ok(v.length === 3, "Decoding array of keywords returns array of same length");
  test.ok(v[0] instanceof t.Keyword, "Decoding array of keywords returns an array of Keyword elements");
  test.ok(v[2].name === "baz", "Decoding array of keywords returns elements of Keyword with expected properties");
  test.done();
};

exports.testDecodeSetOfKeywords = function(test) {
  var dc = d.decoder(),
      v  = dc.decode({"~#set": ["~:foo", "~:bar", "~:baz"]});
  test.ok(v instanceof t.Set, "Decoding a set of keywords produces a Set");
  test.ok(v.size === 3, "Decoding a set of keywords returns a Set of the same size");
  test.done();
};

// dates
exports.testDecodeDates = function(test) {
  var dc = d.decoder(),
      v = dc.decode("~t1985-04-12T23:20:50.052Z");
  test.ok(v instanceof Date, "Decoding a \"~t1985-04-12T23:20:50.052Z\" returns a Date instance");
  test.ok(v.valueOf() === (new Date(Date.UTC(1985,3,12,23,20,50,52))).valueOf(), "Decoding a \"~t1985-04-12T23:20:50.052Z\" returns expected Date instance");
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
  test.ok(v.constructor === t.TaggedValue, "Decoding a tagged value of symbols produces a TaggedValue");
  test.ok(v.tag === "widget", "Decoding a TaggedValue has the correct tag");
  test.ok(v.value.length === 3, "Decoding a TaggedValue preserves properties of value");
  test.ok(v.value[0] instanceof t.Keyword, "Decoding a TaggedValue has the correct decoded values");
  test.done();
};

// overrides

// caching

exports.testDecodeReadCache = function(test) {
  var dc = d.decoder(),
      v  = dc.decode(["~:foo", "^!", "~:bar", "^\""]);
  test.ok(v[0] === v[1] && v[2] == v[3], "Decoding from read cache works.");
  test.done();
};

// edge cases

// =============================================================================
// Encoding
// =============================================================================

exports.testWriterLowLevelEmit = function(test) {
  var em = new wr.JSONMarshaller();

  em.emitArrayStart();
  em.emitArrayEnd();

  test.equal(em.flush(), "[]", "emitStartArray plus emitEndArray returns expected result");

  em.emitMapStart();
  em.emitMapEnd();

  test.equal(em.flush(), "{}", "emitMapStart plus emitMapEnd returns expected result");

  em.emitMapStart();
  em.writeObject("\"foo\"", true);
  em.writeObject("\"bar\"", false);
  em.emitMapEnd();

  test.equal(em.flush(), "{\"foo\":\"bar\"}", "low level map emission returns expected result");

  test.done();
};

exports.testDefaultHandlers = function(test) {
  var em = new wr.JSONMarshaller(),
      c  = caching.writeCache();

  var h0 = em.handler(1),
      h1 = em.handler(true),
      h2 = em.handler(false),
      h3 = em.handler(null),
      h4 = em.handler([]),
      h5 = em.handler({});

  test.equal(h0.tag(1), "i", "Handler for 1 returns \"i\" for tag");
  test.equal(h1.tag(true), "?", "Handler for true returns \"?\" for tag");
  test.equal(h2.tag(false), "?", "Handler for false returns \"?\" for tag");
  test.equal(h3.tag(null), "_", "Handler for null returns \"_\" for tag");
  test.equal(h4.tag([]), "array", "Handler for [] returns \"array\" for tag");
  test.equal(h5.tag({}), "map", "Handler for {} \"object\" for tag");

  test.done();
};

exports.testWriterMarshalling = function(test) {
  var em = new wr.JSONMarshaller(),
      c  = caching.writeCache();

  wr.marshal(em, true, false, c);
  test.ok(em.flush() === "true", "marshalling true returns \"true\"");
  wr.marshal(em, false, false, c);
  test.ok(em.flush() === "false", "marshalling false returns \"false\"");
  wr.marshal(em, 1, false, c);
  test.ok(em.flush() === "1", "marshalling false returns \"1\"");
  wr.marshal(em, 1.5, false, c);
  test.ok(em.flush() === "1.5", "marshalling false returns \"1.5\"");
  wr.marshal(em, "foo", false, c);
  test.equal(em.flush(), "\"foo\"", "marshalling \"foo\" returns \"\\\"foo\\\"\"");
  wr.marshal(em, [1,2,3], false, c);
  test.ok(em.flush() === "[1,2,3]", "marshalling [1,2,3] returns \"[1,2,3]\"");
  wr.marshal(em, {foo: "bar"}, false, c);
  test.ok(em.flush(), "{\"foo\":\"bar\"}", "marshalling {foo:\"bar\"} returns \"{\"foo\":\"bar\"}\"");
  
  test.done();
};
