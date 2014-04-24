var cache = require("cache"),
    types = require("types");

var TransitDecoder = function() {};

TransitDecoder.prototype = {
  defaults: {
    decoders: {
      "_": function(v) { return nil; },
      ":": function(v) { return v; },
      "?": function(v) { return v === "t"; },
      "b": function(v) { return new Buffer(v); },
      "d": function(v) { return v; },
      "i": function(v) { return v; },
      "f": function(v) { return v; },
      "c": function(v) { return v; },
      "$": function(v) { return new types.Symbol(v); },
      "u": function(v) { return new types.UUID(v); },
      "r": function(v) { return URI.parse(v); },

      "'": function(v) { return v; },
      "t": function(v) { return new Date(v); },
      "u": function(v) { return new types.UUID(v); },
      "set": function(v) { return new types.Set(v); },
      "list": function(v) {},
      "ints": function(v) {},
      "longs": function(v) {},
      "floats": function(v) {},
      "doubles": function(v) {},
      "bools": function(v) {},
      "cmap": function(v) {},
    },
    defaultStringDecoder: function(v) { return "" },
    defaultHashDecoder: function(h) { return new TaggedValue(h[0], h[1]) }
  },
  
  decode: function(node, cache, asMapKey) {
    cache = cache || new cache.Cache();
    asMapKey = asMapKey || false;

    if(typeof node == "string") {
    } else if(typeof node == "object") {
    } else if(Array.isArray(node)) {
    }
  }
};
