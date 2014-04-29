var wc = require("../src/transit/cache.js"),
    w  = require("../src/transit/writer.js");

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

exports.testReadCacheRead = function(test) {
  
  test.done();
};
