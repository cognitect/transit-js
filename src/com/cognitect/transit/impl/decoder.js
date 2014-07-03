// Copyright (c) Cognitect, Inc.
// All rights reserved.

goog.provide("com.cognitect.transit.impl.decoder");
goog.require("com.cognitect.transit.util");
goog.require("com.cognitect.transit.delimiters");
goog.require("com.cognitect.transit.caching");
goog.require("com.cognitect.transit.types");

goog.scope(function() {

var decoder = com.cognitect.transit.impl.decoder,
    util    = com.cognitect.transit.util,
    d       = com.cognitect.transit.delimiters,
    caching = com.cognitect.transit.caching,
    types   = com.cognitect.transit.types;

// =============================================================================
// Decoder

decoder.isGroundHandler = function(handler) {
    switch(handler) {
        case "_":
        case "s":
        case "?":
        case "i":
        case "d":
        case "b":
        case "'":
        case "array":
        case "map":
        return true;
    }
    return false;
};

/**
 * A transit decoder
 * @constructor
 */
decoder.Decoder = function(options) {
    this.options = options || {};
    this.handlers = {};
    for(var h in this.defaults.handlers) {
        this.handlers[h] = this.defaults.handlers[h];
    }
    for(var h in this.options["handlers"]) {
        if(decoder.isGroundHandler(h)) {
            throw new Error("Cannot override handler for ground types");
        }
        this.handlers[h] = this.options["handlers"][h];
    }
    this.prefersStrings = this.options["prefersStrings"] != null ? this.options["prefersStrings"] : this.defaults.prefersStrings;
    this.defaultHandler = this.options["defaultHandler"] || this.defaults.defaultHandler;
    /* NOT PUBLIC */
    this.mapBuilder = this.options["mapBuilder"];
    this.arrayBuilder = this.options["arrayBuilder"];
};


decoder.Decoder.prototype.defaults = {
    handlers: {
        "_": function(v) { return types.nullValue(); },
        "?": function(v) { return types.boolValue(v); },
        "b": function(v) { return types.binary(v); },
        "i": function(v) { return types.intValue(v); },
        "n": function(v) { return types.bigInteger(v); },
        "d": function(v) { return types.floatValue(v); },
        "f": function(v) { return types.bigDecimalValue(v); },
        "c": function(v) { return types.charValue(v); },
        ":": function(v) { return types.keyword(v); },
        "$": function(v) { return types.symbol(v); },
        "r": function(v) { return types.uri(v); },

        // tagged
        "'": function(v) { return v; },
        "m": function(v) { return types.date(v); },
        "t": function(v) { return types.verboseDate(v); },
        "u": function(v) { return types.uuid(v); },
        "set": function(v) { return types.set(v); },
        "list": function(v) { return types.list(v); },
        "ints": function(v) { return types.ints(v); },
        "longs": function(v) { return types.longs(v); },
        "floats": function(v) { return types.floats(v); },
        "doubles": function(v) { return types.doubles(v); },
        "bools": function(v) { return types.bools(v); },
        "cmap": function(v) { return types.map(v, false); }
    },
    defaultHandler: function(c, val) {
        return types.taggedValue(c, val);
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
        if(util.isArray(node)) {
            if(node[0] === "^ ") {
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
        var val = this.parseString(string, cache, false);
        if(cache) {
            cache.write(val, asMapKey);
        }
        return val;
    } else if(caching.isCacheCode(string)) {
        return cache.read(string, asMapKey);
    } else {
        return this.parseString(string, cache, asMapKey);
    }
};

decoder.Decoder.prototype.isStringKey = function(node, cache) {
    if(typeof node !== "string") {
        return false;
    } else {
        var c0 = node[0],
            c1 = node[1];
        if(c0 === d.ESC) {
            if(this.handlers[c1] != null) {
                return false;
            } else {
                return (c1 === d.ESC || c1 === d.SUB || c1 === d.RES);
            }
        } else if(c0 === d.SUB && ((typeof cache.read(node)) !== "string"))  {
            return false;
        } else {
            return true;
        }
    }
};

decoder.Decoder.prototype.decodeHash = function(hash, cache, asMapKey, tagValue) {
    var ks     = util.objectKeys(hash),
        key    = ks[0],
        tagKey = ks.length == 1 ? this.decode(key, cache, false, false) : null;

    if((tagKey != null) &&
       (tagKey[0] === d.ESC) &&
       (tagKey[1] === d.TAG)) {
        var val     = hash[key],
            handler = this.handlers[tagKey.substring(2)];
        if(handler != null) {
            return handler(this.decode(val, cache, false, true));
        } else {
            return types.taggedValue(tagKey.substring(2), this.decode(val, cache, false, false));
        }
    } else if(this.mapBuilder) {
        var ret = this.mapBuilder.init();

        for(var i = 0; i < ks.length; i++) {
            var strKey = ks[i];
            ret = this.mapBuilder.add(ret, this.decode(strKey, cache, true, false),
                                           this.decode(hash[strKey], cache, false, false));
        }
        
        return this.mapBuilder.finalize(ret);
    } else {
        var /*stringKeys = true,*/
            nodep      = [];

        for(var i = 0; i < ks.length; i++) {
            var strKey = ks[i];
            /*stringKeys = stringKeys && this.isStringKey(strKey, cache);*/
            nodep.push(this.decode(strKey, cache, true, false));
            nodep.push(this.decode(hash[strKey], cache, false, false));
        }

        return types.map(nodep, false);
    }
};

decoder.Decoder.prototype.decodeArrayHash = function(node, cache, asMapKey, tagValue) {
    if(this.mapBuilder) {
        var ret = this.mapBuilder.init();
        for(var i = 1; i < node.length; i+=2) {
            ret = this.mapBuilder.add(ret, this.decode(node[i], cache, true, false),
                                           this.decode(node[i+1], cache, false, false))
        }
        return this.mapBuilder.finalize(ret);
    } else {
        var /*stringKeys = true,*/
            nodep      = [];

        // collect keys
        for(var i = 1; i < node.length; i +=2) {
            /*stringKeys = stringKeys && this.isStringKey(node[i], cache);*/
            nodep.push(this.decode(node[i], cache, true, false));
            nodep.push(this.decode(node[i+1], cache, false, false));
        }

        return types.map(nodep, false);
    }
};

decoder.Decoder.prototype.decodeArray = function(node, cache, asMapKey, tagValue) {
    if(tagValue) {
        var ret = [];
        for(var i = 0; i < node.length; i++) {
            ret.push(this.decode(node[i], cache, asMapKey, false));
        }
        return ret;
    } else if(this.arrayBuilder) {
        var ret = this.arrayBuilder.init();
        for(var i = 0; i < node.length; i++) {
            ret = this.arrayBuilder.add(ret, this.decode(node[i], cache, asMapKey, false));
        }
        return this.arrayBuilder.finalize(ret);
    } else {
        var ret = [];
        for(var i = 0; i < node.length; i++) {
            ret.push(this.decode(node[i], cache, asMapKey, false));
        }
        return ret;
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
            var handler = this.handlers[c];
            if(handler == null) {
                return this.defaultHandler(c, string.substring(2));
            } else {
                return handler(string.substring(2));
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
