// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("com.cognitect.transit.impl.writer");
goog.require("com.cognitect.transit.caching");
goog.require("com.cognitect.transit.handlers");
goog.require("com.cognitect.transit.types");
goog.require("com.cognitect.transit.delimiters");
goog.require("com.cognitect.transit.stringbuilder");

goog.scope(function() {

var writer   = com.cognitect.transit.impl.writer,
    caching  = com.cognitect.transit.caching,
    handlers = com.cognitect.transit.handlers,
    types    = com.cognitect.transit.types,
    d        = com.cognitect.transit.delimiters,
    sb       = com.cognitect.transit.stringbuilder;

writer.escape = function(string) {
    if(string.length > 0) {
        var c = string[0];
        if(c === d.RES && string[1] === d.ESC) {
            return string.substring(1);
        } else if(c === d.ESC || c === d.SUB || c === d.RES) {
            return d.ESC+string;
        } else {
            return string;
        }
    } else {
        return string;
    }
};

/**
 * @constructor
 */
writer.JSONMarshaller = function(opts) {
    this.opts = opts || {};
    this.buffer = this.opts.buffer || (new sb.StringBuilder());
    this.prefersStrings = this.opts["prefersStrings"] != null ? this.opts["prefersStrings"] : true;

    this.objectBuilder = this.opts["objectBuilder"] || null;

    this.handlers = new handlers.Handlers();
    if(this.opts["handlers"]) {
        for(var i = 0; i < this.opts["handlers"].length; i+=2) {
            this.handlers.set(this.opts["handlers"][i], this.opts["handlers"][i+1]);
        }
    }
};

writer.JSONMarshaller.prototype.handler = function(obj) {
        return this.handlers.get(handlers.constructor(obj));
};

writer.JSONMarshaller.prototype.registerHandler = function(ctor, handler) {
    this.handlers.set(ctor, handler);
};

writer.JSONMarshaller.prototype.emitNil = function(asMapKey, cache) {
    if(asMapKey) {
        return this.emitString(d.ESC, "_", "", asMapKey, cache);
    } else {
        return null;
    }
};

writer.JSONMarshaller.prototype.emitString = function(prefix, tag, s, asMapKey, cache) {
    var string = prefix+tag+s;
    if(cache != null) {
        return cache.write(string, asMapKey);
    } else {
        return string;
    }
};

writer.JSONMarshaller.prototype.emitBoolean = function(b, asMapKey, cache) {
    if(asMapKey) {
        var s = b.toString();
        return this.emitString(d.ESC, "?", s[0], asMapKey, cache);
    } else {
        return b;
    }
};

writer.JSONMarshaller.prototype.emitInteger = function(i, asMapKey, cache) {
    if(asMapKey || (typeof i === "string") || (i instanceof types.Integer)) {
        return this.emitString(d.ESC, "i", i.toString(), asMapKey, cache);
    } else {
        return i;
    }
};

writer.JSONMarshaller.prototype.emitDouble = function(d, asMapKey, cache) {
    if(asMapKey) {
        return this.emitString(d.ESC, "d", d, asMapKey, cache);
    } else {
        return d;
    }
};

writer.JSONMarshaller.prototype.emitBinary = function(b, asMapKey, cache) {
    return this.emitString(d.ESC, "b", b, asMapKey, cache);
};

writer.JSONMarshaller.prototype.emitQuoted = function(obj, cache) {
    var ret = {},
        k   = this.emitString(d.ESC_TAG, "'", "", true, cache);
    ret[k] = writer.marshal(this, obj, false, cache);
    return ret;
};

writer.emitInts = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitInt(em, src[i], false, cache));
    }
    return ret;
};

writer.emitShorts = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitShort(em, src[i], false, cache));
    }
    return ret;
};

writer.emitLongs = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitInt(em, src[i], false, cache));
    }
    return ret;
};

writer.emitFloats = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitFloat(em, src[i], false, cache));
    }
    return ret;
};

writer.emitDouble = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitDouble(em, src[i], false, cache));
    }
    return ret;
};

writer.emitChars = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(writer.marshal(em, src[i], false, cache));
    }
    return ret;
};

writer.emitBooleans = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitBoolean(em, src[i], false, cache));
    }
    return ret;
};

writer.emitObjects = function(em, iterable, cache) {
    var ret = [];
    if(Array.isArray(iterable)) {
        for(var i = 0; i < iterable.length; i++) {
            ret.push(writer.marshal(em, iterable[i], false, cache));
        }
    } else {
        iterable.forEach(function(v, i) {
            ret.push(writer.marshal(em, v, false, cache));
        });
    }
    return ret;
};

writer.emitArray = function(em, iterable, skip, cache) {
    if(iterable instanceof Int8Array) {
        return writer.emitChars(em, iterable, cache);
    } else if(iterable instanceof Int16Array) {
        return writer.emitShorts(em, iterable, cache);
    } else if(iterable instanceof Int32Array) {
        return writer.emitInts(em, iterable, cache);
    } else if(iterable instanceof Float32Array) {
        return writer.emitFloats(em, iterable, cache);
    } else if(iterable instanceof Float64Array) {
        return writer.emitDoubles(em, iterable, cache);
    } else {
        return writer.emitObjects(em, iterable, cache);
    }
};

writer.emitMap = function(em, obj, skip, cache) {
    if(obj.constructor === Object) {
        var ret = {},
            ks  = Object.keys(obj);
        for(var i = 0; i < ks.length; i++) {
            ret[writer.marshal(em, ks[i], true, cache)] = writer.marshal(em, obj[ks[i]], false, cache);
        }
        return ret;
    } else if(em.objectBuilder != null) {
        return em.objectBuilder(obj, function(k) { return writer.marshal(em, k, true, cache);  },
                                     function(v) { return writer.marshal(em, v, false, cache); });
    } else {
        var err = new Error("Not supported");
        err.data = {obj: obj, type: handlers.constructor(obj).name};
        throw err;
    }
};

writer.emitTaggedMap = function(em, tag, rep, skip, cache) {
    var ret = {};
    ret[em.emitString(d.ESC_TAG, tag, "", true, cache)] = writer.marshal(em, rep, false, cache);
    return ret;
};

writer.emitEncoded = function(em, h, tag, rep, obj, asMapKey, cache) {
    if(tag.length === 1) {
        if(typeof rep === "string") {
            return em.emitString(d.ESC, tag, rep, asMapKey, cache);
        } else if(asMapKey || em.prefersStrings) {
            rep = h.stringRep(obj, h);
            if(rep !== null) {
                return em.emitString(d.ESC, tag, rep, asMapKey, cache);
            } else {
                var err = new Error("Cannot be encoded as string");
                err.data = {tag: tag, rep: rep, obj: obj};
                throw err;
            }
        } else {
            return writer.emitTaggedMap(em, tag, rep, asMapKey, cache);
        }
    } else if (asMapKey) {
        var err = new Error("Cannot be used as map key");
        err.data = {tag: tag, rep: rep, obj: obj};
        throw err;
    } else {
        return writer.emitTaggedMap(em, tag, rep, asMapKey, cache);
    }
}

writer.marshal = function(em, obj, asMapKey, cache) {
    var h   = em.handler(obj),
        tag = h ? h.tag(obj) : null,
        rep = h ? h.rep(obj) : null;

    if(h != null && tag != null) {
        switch(tag) {
        case "_":
            return em.emitNil(asMapKey, cache);
            break;
        case "s":
            return em.emitString("", "", writer.escape(rep), asMapKey, cache);
            break;
        case "?":
            return em.emitBoolean(rep, asMapKey, cache);
            break;
        case "i":
            return em.emitInteger(rep, asMapKey, cache);
            break;
        case "d":
            return em.emitDouble(rep, asMapKey, cache);
            break;
        case "b":
            return em.emitBinary(rep, asMapKey, cache);
            break;
        case "'":
            return em.emitQuoted(rep, cache);
            break;
        case "array":
            return writer.emitArray(em, rep, asMapKey, cache);
            break;
        case "map":
            return writer.emitMap(em, rep, asMapKey, cache);
            break;
        default:
            return writer.emitEncoded(em, h, tag, rep, obj, asMapKey, cache);
            break;
        }
    } else {
        var err = new Error("Not supported");
        err.data = {obj: obj, type: handlers.constructor(obj).name};
        throw err;
    }
};

writer.maybeQuoted = function(em, obj) {
    var h = em.handler(obj);

    if(h != null) {
        if(h.tag(obj).length === 1) {
            return types.quoted(obj);
        } else {
            return obj;
        }
    } else {
        var err = new Error("Not supported");
        err.data = {obj: obj, type: handlers.constructor(obj).name};
        throw err;
    }
};

writer.marshalTop = function(em, obj, cache) {
    return JSON.stringify(writer.marshal(em, writer.maybeQuoted(em, obj), false, cache));
};

/**
 * @constructor
 */
writer.Writer = function(marshaller, options) {
    this.marshaller = marshaller;
    this.options = options || {};
    if(this.options["cache"] === false) {
        this.cache = null;
    } else {
        this.cache = this.options["cache"] ? this.options["cache"] : new caching.WriteCache();
    }
};

writer.Writer.prototype.write = function(obj) {
    var ret = writer.marshalTop(this.marshaller, obj, this.cache)
    if(this.cache != null) {
        this.cache.clear();
    }
    return ret;
};
writer.Writer.prototype["write"] = writer.Writer.prototype.write;

writer.Writer.prototype.register = function(type, handler) {
    this.marshaller.registerHandler(type, handler);
};
writer.Writer.prototype["register"] = writer.Writer.prototype.register;

});
