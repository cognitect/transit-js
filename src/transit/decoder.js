// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("transit.decoder");
goog.require("transit.delimiters");
goog.require("transit.caching");
goog.require("transit.types");

// =============================================================================
// Decoder

/**
 * A transit decoder
 * @constructor
 */
transit.decoder.Decoder = function(options) {
    this.options = options || {};
    this.decoders = {};
    for(var decoder in this.defaults.decoders) {
        this.decoders[decoder] = this.defaults.decoders[decoder];
    }
    for(var decoder in this.options.decoders) {
        this.decoders[decoder] = this.options.decoders[decoder];
    }
};


transit.decoder.Decoder.prototype.defaults = {
    decoders: {
        "_": function(v) { return transit.types.nullValue(); },
        "?": function(v) { return transit.types.boolValue(v); },
        "b": function(v) { return transit.types.binary(v); },
        "i": function(v) { return transit.types.intValue(v); },
        "d": function(v) { return transit.types.floatValue(v); },
        "f": function(v) { return transit.types.bigDecimalValue(v); },
        "c": function(v) { return transit.types.charValue(v); },
        ":": function(v) { return transit.types.keyword(v); },
        "$": function(v) { return transit.types.symbol(v); },
        "r": function(v) { return transit.types.uri(v); },

        // tagged
        "'": function(v) { return v; },
        "t": function(v) { return transit.types.date(v); },
        "u": function(v) { return transit.types.uuid(v); },
        "set": function(v) { return transit.types.set(v); },
        "list": function(v) { return transit.types.list(v); },
        "ints": function(v) { return transit.types.ints(v); },
        "longs": function(v) { return transit.types.longs(v); },
        "floats": function(v) { return transit.types.floats(v); },
        "doubles": function(v) { return transit.types.doubles(v); },
        "bools": function(v) { return transit.types.bools(v); },
        "cmap": function(v) { return transit.types.cmap(v); }
    },
    prefersStrings: true
};

transit.decoder.Decoder.prototype.decode = function(node, cache, asMapKey) {
    cache = cache || new transit.caching.ReadCache();
    asMapKey = asMapKey || false;

    if(node == null) return null;

    var t = typeof node;

    switch(t) {
    case "string":
        return this.decodeString(node, cache, asMapKey);
        break;
    case "object":
        if(Array.isArray(node)) {
            return this.decodeArray(node, cache);
        } else {
            return this.decodeHash(node, cache, asMapKey);
        }
        break;
    }

    return node;
};

transit.decoder.Decoder.prototype.decodeString = function(string, cache, asMapKey) {
    if(transit.caching.isCacheable(string, asMapKey)) {
        var val = this.parseString(string, cache, asMapKey);
        cache.write(string, val, asMapKey);
        return val;
    } else if(transit.caching.isCacheCode(string)) {
        return cache.read(string, asMapKey);
    } else {
        return this.parseString(string, cache, asMapKey);
    }
};

transit.decoder.Decoder.prototype.decodeHash = function(hash, cache, asMapKey) {
    var ks     = Object.keys(hash),
        key    = ks[0],
        tagKey = ks.length == 1 ? this.decode(key, cache, false) : null;

    if((tagKey != null) &&
       (tagKey[0] === transit.delimiters.ESC) &&
       (tagKey[1] === transit.delimiters.TAG)) {
        var val     = hash[key],
            decoder = this.decoders[tagKey.substring(2)];
        if(decoder != null) {
            return decoder(this.decode(val, cache, false));
        } else {
            return transit.types.taggedValue(tagKey.substring(2), this.decode(val, cache, false));
        }
    } else {
        var ret = {};
        for(var i = 0; i < ks.length; i++) {
            var key  = ks[i],
                skey = this.decode(key, cache, true);
            ret[skey] = this.decode(hash[key], cache, false);
        }
        return ret;
    }
};

transit.decoder.Decoder.prototype.decodeArray = function(node, cache, asMapKey) {
    var res = [];
    for(var i = 0; i < node.length; i++) {
        res.push(this.decode(node[i], cache, asMapKey));
    }
    return res;
},

transit.decoder.Decoder.prototype.parseString = function(string, cache, asMapKey) {
    if(string[0] === transit.delimiters.ESC) {
        var c = string[1];
        if(c === transit.delimiters.ESC || c === transit.delimiters.SUB || c === transit.delimiters.RES) {
            return string.substring(1);
        } else if (c === transit.delimiters.TAG) {
            return string;
        } else {
            var decoder = this.decoders[c];
            if(asMapKey == true || decoder == null) {
                return transit.delimiters.RES+string;
            } else {
                return decoder(string.substring(2));
            }
        }
    } else {
        return string;
    }
};

