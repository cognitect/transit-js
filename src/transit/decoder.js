var cache = require("cache"),
    types = require("types");

var Decoder = function() {};

Decoder.prototype = {
  defaults: {
    decoders: {
      "_": function(v) { return nil; },
      ":": function(v) { return v; },
      "?": function(v) { return v === "t"; },
      "b": function(v) { return types.byteBuffer(v); },
      "i": function(v) { return parseInt(v); },
      "d": function(v) { return parseFloat(v); },
      "f": function(v) { return parseFloat(v); },
      "c": function(v) { return c; },
      "$": function(v) { return types.symbol(v); },
      "u": function(v) { return types.uuid(v); },
      "r": function(v) { return types.uri(v); },

      "'": function(v) { return v; },
      "t": function(v) { return types.date(v); },
      "u": function(v) { return types.uuid(v); },
      "set": function(v) { return types.set(v); },
      "list": function(v) { return types.list(v); },
      "ints": function(v) { return types.ints(v); },
      "longs": function(v) { return types.longs(v); },
      "floats": function(v) { return types.floats(v); },
      "doubles": function(v) { return types.doubles(v); },
      "bools": function(v) { return types.bools(v); },
      "cmap": function(v) { return types.map(v); },
    },
    defaultStringDecoder: function(v) { return "" },
    defaultHashDecoder: function(h) { return types.taggedValue(h[0], h[1]) }
  },
  
  decode: function(node, cache, asMapKey) {
    cache = cache || new cache.writeCache();
    asMapKey = asMapKey || false;

    if(typeof node == "string") {
      this.decodeString(node, cache, asMapKey);
    } else if(typeof node == "object") {
      this.decodeHash(node, cache, asMapKey);
    } else if(Array.isArray(node)) {
      this.decodeArray(node, cache);
    }
  },

  decodeString: function(string, cache, asMapKey) {
    return cache.read(string, this, asMapKey);
    /*
    if(cache.isCacheable(string, asMapKey)) {
      cache.write(string, asMapKey);
      this.parseString(string, cache, asMapKey);
    } else if(cache.isCacheCode(string)) {
      this.parseString(cache.read(
    } else {
      this.parseString(string, cache, asMapKey);
    }
    */
  },

  decodeHash: function() {
  },

  decodeArray: function() {
    var self = this;
    return node.map(function(x) { return self.decode(x, cache, false); });
  },

  parseString: function(string, cache, asMapKey) {
  }

  register: function(tagOrKey, type, rest) {
  }
};

module.exports = {
  decoder: decoder
};
