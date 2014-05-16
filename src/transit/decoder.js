// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var caching = require("./caching"),
    types   = require("./types"),
    d       = require("./delimiters");

// =============================================================================
// Decoder

var Decoder = function(options) {
    this.options = options || {};
    this.decoders = {};
    for(var decoder in this.defaults.decoders) {
        this.decoders[decoder] = this.defaults.decoders[decoder];
    }
    for(var decoder in this.options.decoders) {
        this.decoders[decoder] = this.options.decoders[decoder];
    }
};


Decoder.prototype = {
    defaults: {
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
        prefersStrings: true
    },

    decode: function(node, cache, asMapKey) {
        cache = cache || new caching.readCache();
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
    },

    decodeString: function(string, cache, asMapKey) {
        if(caching.isCacheable(string, asMapKey)) {
            var val = this.parseString(string, cache, asMapKey);
            cache.write(string, val, asMapKey);
            return val;
        } else if(caching.isCacheCode(string)) {
            return cache.read(string, asMapKey);
        } else {
            return this.parseString(string, cache, asMapKey);
        }
    },

    decodeHash: function(hash, cache, asMapKey) {
        var ks     = Object.keys(hash),
            key    = ks[0],
            tagKey = ks.length == 1 ? this.decode(key, cache, false) : null;

        if((tagKey != null) &&
           (tagKey[0] === d.ESC) &&
           (tagKey[1] === d.TAG)) {
            var val     = hash[key],
                decoder = this.decoders[tagKey.substring(2)];
            if(decoder != null) {
                return decoder(this.decode(val, cache, false));
            } else {
                return types.taggedValue(tagKey.substring(2), this.decode(val, cache, false));
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
    },

    decodeArray: function(node, cache, asMapKey) {
        var res = [];
        for(var i = 0; i < node.length; i++) {
            res.push(this.decode(node[i], cache, asMapKey));
        }
        return res;
    },

    parseString: function(string, cache, asMapKey) {
        if(string[0] === d.ESC) {
            var c = string[1];
            if(c === d.ESC || c === d.SUB || c === d.RES) {
                return string.substring(1);
            } else if (c === d.TAG) {
                return string;
            } else {
                var decoder = this.decoders[c];
                if(asMapKey == true || decoder == null) {
                    return d.RES+string;
                } else {
                    return decoder(string.substring(2));
                }
            }
        } else {
            return string;
        }
    }
};

function decoder(options) {
    return new Decoder(options);
};

module.exports = {
    decoder: decoder,
    Decoder: Decoder
};
