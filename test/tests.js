var caching = require("../src/transit/caching.js"),
    w       = require("../src/transit/writer.js"),
    d       = require("../src/transit/decoder.js"),
    t       = require("../src/transit/types.js");

// =============================================================================
// Implementation Tests

exports.testIsCacheable = function(test) {
  test.ok(caching.isCacheable("~:f", false) == false, "\"~:f\" should not be cached");
  test.ok(caching.isCacheable("~:f", true) == false, "\"~:f\" with asMapKey true should be cached");
  test.ok(caching.isCacheable("~:foobar", false) == true, "\"~:foobar\" should be cached");
  test.ok(caching.isCacheable("~$foobar", false) == true, "\"~$foobar\" should be cached");
  test.ok(caching.isCacheable("~#foobar", false) == true, "\"#foobar\" should be cached");
  test.ok(caching.isCacheable("~foobar", false) == false, "\"~foobar\" should not be cached");
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
  test.ok(dc.getDecoder(":")("foo").s == "foo", "Can access symbol decoder and invoke");
  test.ok(dc.getDecoder("i")("1") == 1, "Can access integer decoder and invoke");
  test.ok(dc.getDecoder("f")("1.5") == 1.5, "Can access float decoder and invoke");
  test.done();
};

// =============================================================================
// Decoding

exports.testDecodeKeyword = function(test) {
  var dc = d.decoder(),
      v  = dc.decode("~:foo");
  test.ok(v.constructor === t.Keyword, "~:foo is decoded into an instance of Symbol");
  test.ok(v.s === "foo", "~:foo is decoded into a Symbol with the right properties");
  test.done();
}

exports.testDecodeArrayOfSymbols = function(test) {
  var dc = d.decoder(),
      v  = dc.decode(["~:foo", "~:bar", "~:baz"]);
  test.ok(v.length === 3, "Decoding array of symbols returns array of same length");
  test.ok(v[0].constructor === t.Keyword, "Decoding array of symbols returns an array of Symbol elements");
  test.ok(v[2].s === "baz", "Decoding array of symbols returns elements of Symbol with expected properties");
  test.done();
}

exports.testDecodeSetOfSymbols = function(test) {
  var dc = d.decoder(),
      v  = dc.decode({"~#set": ["~:foo", "~:bar", "~:baz"]});
  test.ok(v.constructor === t.Set, "Decoding a set of symbols produces a Set");
  test.ok(v.size === 3, "Decoding a set of symbols returns a Set of the same size");
  test.done();
}

exports.testDecodeTaggedValue = function(test) {
  var dc = d.decoder(),
      v  = dc.decode({"~#widget": ["~:foo", "~:bar", "~:baz"]});
  test.ok(v.constructor === t.TaggedValue, "Decoding a tagged value of symbols produces a TaggedValue");
  test.done();
}
