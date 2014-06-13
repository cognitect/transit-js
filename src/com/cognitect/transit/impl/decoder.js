// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("com.cognitect.transit.impl.decoder");
goog.require("com.cognitect.transit.delimiters");
goog.require("com.cognitect.transit.caching");
goog.require("com.cognitect.transit.types");

goog.scope(function() {

var decoder = com.cognitect.transit.impl.decoder,
    d       = com.cognitect.transit.delimiters,
    caching = com.cognitect.transit.caching,
    types   = com.cognitect.transit.types;

// =============================================================================
// Decoder

/**
 * A transit decoder
 * @constructor
 */
decoder.Decoder = function(options) {
    this.options = options || {};
    this.decoders = {};
    for(var decoder in this.defaults.decoders) {
        this.decoders[decoder] = this.defaults.decoders[decoder];
    }
    for(var decoder in this.options["decoders"]) {
        this.decoders[decoder] = this.options["decoders"][decoder];
    }
    this.defaultStringDecoder = this.options["defaultStringDecoder"] || this.defaults.defaultStringDecoder;
    this.defaultMapBuilder = this.options["defaultMapBuilder"] || this.defaults.defaultMapBuilder;
    this.defaultArrayBuilder = this.options["defaultArrayBuilder"] || this.defaults.defaultArrayBuilder;
    this.prefersStrings = this.options["prefersStrings"] != null ? this.options["prefersStrings"] : this.defaults.prefersStrings;
};


decoder.Decoder.prototype.defaults = {
    decoders: {
        "_": function(v) { return types.nullValue(); },
        "?": function(v) { return types.boolValue(v); },
        "b": function(v) { return types.binary(v); },
        "i": function(v) { return types.intValue(v); },
        "d": function(v) { return types.floatValue(v); },
        "f": function(v) { return types.bigDecimalValue(v); },
        "c": function(v) { return types.charValue(v); },
        ":": function(v) { return types.keyword(v); },
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
        "cmap": function(v) { return types.cmap(v); }
    },
    defaultStringDecoder: function(v) {
        return d.RES+v;
    },
    defaultMapBuilder: {
        init: function() { return {}; },
        add:  function(m, k, v) { m[k] = v; return m; }
    },
    defaultArrayBuilder: {
        init: function() { return []; },
        add:  function(a, v) { a.push(v); return a; }
    },
    prefersStrings: true
};

decoder.Decoder.prototype.decode = function(node, cache, asMapKey, tagValue) {
    if(node == null) return null;

    var t = typeof node;

    switch(t) {
    case "string":
        return this.decodeString(node, cache, asMapKey, tagValue);
        break;
    case "object":
        if(Array.isArray(node)) {
            if(node.length > 1 && node[0] === "^ ") {
                return this.decodeArrayHash(node, cache, asMapKey, tagValue);
            } else {
                return this.decodeArray(node, cache, false, tagValue);
            }
        } else {
            return this.decodeHash(node, cache, asMapKey, tagValue);
        }
        break;
    }

    return node;
};
decoder.Decoder.prototype["decode"] = decoder.Decoder.prototype.decode;

decoder.Decoder.prototype.decodeString = function(string, cache, asMapKey, tagValue) {
    if(caching.isCacheable(string, asMapKey)) {
        var val    = this.parseString(string, cache, false),
            mapKey = this.parseString(string, cache, true);
        if(cache) {
            cache.write(val, mapKey, asMapKey);
        }
        if(asMapKey) {
            return mapKey;
        } else {
            return val;
        }
    } else if(caching.isCacheCode(string)) {
        return cache.read(string, asMapKey, this.prefersStrings);
    } else {
        return this.parseString(string, cache, asMapKey);
    }
};

decoder.Decoder.prototype.decodeHash = function(hash, cache, asMapKey, tagValue) {
    var ks     = Object.keys(hash),
        key    = ks[0],
        tagKey = ks.length == 1 ? this.decode(key, cache, false, false) : null;

    if((tagKey != null) &&
       (tagKey[0] === d.ESC) &&
       (tagKey[1] === d.TAG)) {
        var val     = hash[key],
            decoder = this.decoders[tagKey.substring(2)];
        if(decoder != null) {
            return decoder(this.decode(val, cache, false, true));
        } else {
            return types.taggedValue(tagKey.substring(2), this.decode(val, cache, false, false));
        }
    } else {
        var ret = this.defaultMapBuilder.init();
        for(var i = 0; i < ks.length; i++) {
            var strKey = ks[i],
                key    = this.decode(strKey, cache, true);
            ret = this.defaultMapBuilder.add(ret, key, this.decode(hash[strKey], cache, false, false));
        }
        if(this.defaultMapBuilder.finalize != null) {
            return this.defaultMapBuilder.finalize(ret);
        } else {
            return ret;
        }
    }
};

decoder.Decoder.prototype.decodeArrayHash = function(node, cache, asMapKey, tagValue) {
    var ret = {};
    for(var i = 1; i < node.length; i +=2) {
        ret[this.decode(node[i], cache, true, false)] = this.decode(node[i+1], cache, false, false)
    }
    return ret;
};

decoder.Decoder.prototype.decodeArray = function(node, cache, asMapKey, tagValue) {
    if(tagValue) {
        var ret = [];
        for(var i = 0; i < node.length; i++) {
            ret.push(this.decode(node[i], cache, asMapKey, false));
        }
        return ret;
    } else {
        var ret = this.defaultArrayBuilder.init();
        for(var i = 0; i < node.length; i++) {
            ret = this.defaultArrayBuilder.add(ret, this.decode(node[i], cache, asMapKey, false));
        }
        if(this.defaultArrayBuilder.finalize) {
            return this.defaultMapBuilder.finalize(ret);
        } else {
            return ret;
        }
    }
};

decoder.Decoder.prototype.parseString = function(string, cache, asMapKey) {
    if(string[0] === d.ESC) {
        var c = string[1];
        if(c === d.ESC || c === d.SUB || c === d.RES) {
            return string.substring(1);
        } else if (c === d.TAG) {
            return string;
        } else {
            var decoder = this.decoders[c];
            if((asMapKey == true && this.prefersStrings) || decoder == null) {
                return this.defaultStringDecoder(string);
            } else {
                return decoder(string.substring(2));
            }
        }
    } else {
        return string;
    }
};

decoder.decoder = function(options) {
    return new decoder.Decoder(options);
};

});
