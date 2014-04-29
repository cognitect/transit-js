var cache = require("cache"),
    types = require("types");

var TransitDecoder = function() {};

TransitDecoder.prototype = {
  defaults: {
    decoders: {
      "_": function(v) { return nil; },
      ":": function(v) { return v; },
      "?": function(v) { return v === "t"; },
      "b": function(v) { return types.byteBuffer(v); },
      "d": function(v) { return v; },
      "i": function(v) { return v; },
      "f": function(v) { return v; },
      "c": function(v) { return v; },
      "$": function(v) { return types.symbol(v); },
      "u": function(v) { return types.uuid(v); },
      "r": function(v) { return URI.parse(v); },

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
      "cmap": function(v) { return types.cmap(v); },
    },
    defaultStringDecoder: function(v) { return "" },
    defaultHashDecoder: function(h) { return types.taggedValue(h[0], h[1]) }
  },
  
  decode: function(node, cache, asMapKey) {
    cache = cache || new cache.Cache();
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
    if(cache.isCacheable(string, asMapKey)) {
      
    } else if(cache.isCacheKey(string)) {
      
    } else {
      
    }
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
