var cache = require("./cache"),
    types = require("./types"),
    d     = require("./delimiters");

var ESCAPED_ESC = new RegExp(d.ESC),
    ESCAPED_SUB = new RegExp(d.SUB),
    ESCAPED_RES = new RegExp(d.RES),
    IS_ESCAPED  = new RegExp("^"+ESCAPED_SUB+"("+ESCAPED_SUB+"|"+ESCAPED_ESC+"|"+ESCAPED_RES+")"),
    IS_UNRECOGNIZED = new RegExp(d.ESC+"\w");

// =============================================================================
// Decoder

var Decoder = function(options) {
  this.options = options;
};


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
  
  getDecoder: function(key) {
    return this.options.decoders[key] || this.defaults.decoders[key];
  },

  setDecoder: function(key, b) {
    this.options.decoders[key] = b;
  },

  decode: function(node, cache, asMapKey) {
    cache = cache || new cache.readCache();
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
      var val = this.parseString(string, cache, asMapKey);
      cache.write(string, val);
      return val;
    } else if(cache.isCacheCode(string)) {
      return this.cache.read(string);
    } else {
      return this.parseString(string, cache, asMapKey);
    }
  },

  decodeHash: function(hash, cache, asMapKey) {
    var ks = Object.keys(hash);
    if(ks.length == 1) {
      var key     = decode(ks[0], cache, true),
          decoder = this.getDecoder(key);
      if(decoder) {
        return decoder(decode(hash[ks[0]], cache, false));
      } else if(typeof key == "string" && key.match(/^~#/)) {
        return this.getDecoder("default_hash_decoder")(hash[ks[0]], cache, false);
      } else {
        var res = {};
        res[key] = decode(hash[ks[0]], cache, false)
        return res;
      }
    } else {
      var res = {};
      for(var i = 0; i < ks.length; i++) {
      }
      return res;
    }
  },

  decodeArray: function(node, cache, asMapKey) {
    var self = this,
        res  = [];
    for(var i = 0; i < node.length; i++) {
      res.push(this.decode(node[i], cache, asMapKey));
    }
    return res;
  },

  parseString: function(string, cache, asMapKey) {
    
  }
};

function decoder(options) {
  return new Decoder(options);
}

module.exports = {
  decoder: decoder
};
