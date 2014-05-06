"use strict";

var caching = require("./caching"),
    types   = require("./types"),
    d       = require("./delimiters");

// =============================================================================
// Utilities

function regexpEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

var ESC_ESC = regexpEscape(d.ESC),
    ESC_SUB = regexpEscape(d.SUB),
    ESC_RES = regexpEscape(d.RES),
    IS_ESCAPED  = new RegExp("^"+ESC_ESC+"("+ESC_SUB+"|"+ESC_ESC+"|"+ESC_RES+")"),
    IS_UNRECOGNIZED = new RegExp("^"+d.ESC+"\w");

// =============================================================================
// Decoder

var Decoder = function(options) {
  this.options = options || {};
  if(!this.options.decoders) {
    this.options.decoders = {};
  }
};


Decoder.prototype = {
  defaults: {
    decoders: {
      "_": function(v) { return types.nullValue(); },
      ":": function(v) { return types.keyword(v); },
      "?": function(v) { return types.boolValue(v); },
      "b": function(v) { return types.byteBuffer(v); },
      "i": function(v) { return types.intValue(v); },
      "d": function(v) { return types.floatValue(v); },
      "f": function(v) { return types.floatValue(v); },
      "c": function(v) { return types.charValue(v); },
      "$": function(v) { return types.symbol(v); },
      "r": function(v) { return types.uri(v); },

      // tagged
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
    defaultStringDecoder: function(v) { return "`"+s },
    defaultHashDecoder: function(h) {
      var ks = Object.keys(h), key = ks[0];
      return types.taggedValue(key, h[key]);
    }
  },
  
  getOption: function(key) {
    return this.options[key] || this.defaults[key];
  },

  getDecoder: function(key) {
    return this.options.decoders[key] || this.defaults.decoders[key];
  },

  setDecoder: function(key, b) {
    this.options.decoders[key] = b;
  },

  decode: function(node, cache, asMapKey) {
    cache = cache || new caching.readCache();
    asMapKey = asMapKey || false;

    if(typeof node === "string") {
      return this.decodeString(node, cache, asMapKey);
    } else if(Array.isArray(node)) {
      return this.decodeArray(node, cache);
    } else if(node === null) {
      return node;
    } else if(typeof node === "object") {
      return this.decodeHash(node, cache, asMapKey);
    } else {
      return node;
    }
  },

  decodeString: function(string, cache, asMapKey) {
    if(caching.isCacheable(string, asMapKey)) {
      var val = this.parseString(string, cache, asMapKey);
      cache.write(string, val);
      return val;
    } else if(caching.isCacheCode(string)) {
      return cache.read(string);
    } else {
      return this.parseString(string, cache, asMapKey);
    }
  },

  decodeHash: function(hash, cache, asMapKey) {
    var ks = Object.keys(hash);
    if((ks.length === 1) &&
       (ks[0][0]  === d.ESC) &&
       (ks[0][1]  === d.TAG)) {
      var key     = ks[0],
          val     = hash[ks[0]],
          decoder = this.getDecoder(key.substring(2));
      if(decoder) {
        return decoder(this.decode(val, cache, false));
      } else {
        var h = {}; h[key.substring(2)] = this.decode(val,cache);
        return this.getOption("defaultHashDecoder")(h, cache, false); 
      }
    } else {
      var ret = {};
      for(var i = 0; i < ks.length; i++) {
        var key = this.decode(ks[i], cache, true);
        ret[key] = this.decode(hash[ks[i]], cache, false);
      }
      return ret;
    }
  },

  decodeArray: function(node, cache, asMapKey) {
    var res = [];
    for(var i = 0; i < node.length; i++) {
      res.push(this.decode(node[i], cache, asMapKey));
    }
    return res;
  },

  parseString: function(string, cache, asMapKey) {
    if(IS_ESCAPED.test(string)) {
      return string.substring(1);
    } else {
      var decoder = this.getDecoder(string[1]);
      if(decoder) {
        return decoder(string.substring(2));
      } else if(IS_UNRECOGNIZED.test(string)) {
        return this.getOption("defaultStringDecoder")(string);
      } else {
        return string;
      }
    }
  }
};

function decoder(options) {
  return new Decoder(options);
}

module.exports = {
  decoder: decoder,
  Decoder: Decoder
};

