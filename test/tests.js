var wc = require("../src/transit/cache.js"),
    w  = require("../src/transit/writer.js"),
    d  = require("../src/transit/decoder.js");

exports.testIsCacheable = function(test) {
  test.ok(wc.isCacheable("~:f", false) == false, "\"~:f\" should not be cached");
  test.ok(wc.isCacheable("~:f", true) == false, "\"~:f\" with asMapKey true should be cached");
  test.ok(wc.isCacheable("~:foobar", false) == true, "\"~:foobar\" should be cached");
  test.ok(wc.isCacheable("~$foobar", false) == true, "\"~$foobar\" should be cached");
  test.ok(wc.isCacheable("~#foobar", false) == true, "\"#foobar\" should be cached");
  test.ok(wc.isCacheable("~foobar", false) == false, "\"~foobar\" should not be cached");
  test.done();
};

exports.testWriteCacheWrite = function(test) {
  var cache = wc.writeCache();
  cache.write("~:foobar", false);
  test.deepEqual(cache.cache, {"~:foobar":"^!"}, "First cache write should map to \"^!\"");
  test.done();
};

exports.testIsCacheCode = function(test) {
  test.ok(wc.isCacheCode("^!"), "\"^!\" is a cache code");
  test.done();
};

exports.testReadCacheWrite = function(test) {
  var cache = wc.readCache();
  cache.write("~:foo", "foo");
  test.ok(cache.cache.length == wc.MAX_CACHE_ENTRIES, "Read cache size does not exceed maximum");
  test.ok(cache.idx == 1, "Single read cache write bumps cache index");
  test.done();
};

exports.testReadCacheRead = function(test) {
  var cache = wc.readCache();
  cache.write("~:foo", "foo");
  test.ok(cache.read("^!") == "foo", "Single read cache read after cache write returns expected value");
  test.done();
};

exports.testDecoderDecode = function(test) {
  
  test.done();
};

