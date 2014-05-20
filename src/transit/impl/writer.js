// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("transit.impl.writer");
goog.require("transit.handlers");
goog.require("transit.types");
goog.require("transit.delimiters");
goog.require("transit.stringbuilder");

transit.impl.writer.escape = function(string) {
    if(string.length > 0) {
        var c = string[0];
        if(c === transit.delimiters.RES && string[1] === transit.delimiters.ESC) {
            return string.substring(1);
        } else if(c === transit.delimiters.ESC || c === transit.delimiters.SUB || c === transit.delimiters.RES) {
            return transit.delimiters.ESC+string;
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
transit.impl.writer.JSONMarshaller = function(options) {
    this.buffer = (options && options.buffer) || sb.stringBuilder();
    this.handlers = transit.handlers.handlers();
    this._prefersStrings = options ? options.prefersString || false : true;
};

transit.impl.writer.JSONMarshaller.prototype.handler = function(obj) {
        return this.handlers.get(transit.handlers.constructor(obj));
};

transit.impl.writer.JSONMarshaller.prototype.registerHandler = function(ctor, handler) {
    this.handlers.set(ctor, handler);
};

transit.impl.writer.JSONMarshaller.prototype.emitNil = function(asMapKey, cache) {
    if(asMapKey) {
        return this.emitString(d.ESC, "_", "", asMapKey, cache);
    } else {
        return null;
    }
};

transit.impl.writer.JSONMarshaller.prototype.emitString = function(prefix, tag, s, asMapKey, cache) {
    return cache.write(prefix+tag+s, asMapKey);
};

transit.impl.writer.JSONMarshaller.prototype.emitBoolean = function(b, asMapKey, cache) {
    if(asMapKey) {
        var s = b.toString();
        return this.emitString(d.ESC, "?", s[0], asMapKey, cache);
    } else {
        return b;
    }
};

transit.impl.writer.JSONMarshaller.prototype.emitInteger = function(i, asMapKey, cache) {
    if(asMapKey || (typeof i === "string") || (i instanceof t.Integer)) {
        return this.emitString(d.ESC, "i", i.toString(), asMapKey, cache);
    } else {
        return i;
    }
};

transit.impl.writer.JSONMarshaller.prototype.emitDouble = function(d, asMapKey, cache) {
    if(asMapKey) {
        return this.emitString(d.ESC, "d", d, asMapKey, cache);
    } else {
        return d;
    }
};

transit.impl.writer.JSONMarshaller.prototype.emitBinary = function(b, asMapKey, cache) {
    return this.emitString(d.ESC, "b", b, asMapKey, cache);
};

transit.impl.writer.JSONMarshaller.prototype.emitQuoted = function(obj, cache) {
    var ret = {},
        k   = this.emitString(d.ESC_TAG, "'", "", true, cache);
    ret[k] = transit.impl.writer.marshal(this, obj, false, cache);
    return ret;
};

transit.impl.writer.JSONMarshaller.prototype.prefersStrings = function() {
    return this._prefersStrings;
};

transit.impl.writer.emitInts = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitInt(em, src[i], false, cache));
    }
    return ret;
};

transit.impl.writer.emitShorts = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitShort(em, src[i], false, cache));
    }
    return ret;
};

transit.impl.writer.emitLongs = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitInt(em, src[i], false, cache));
    }
    return ret;
};

transit.impl.writer.emitFloats = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitFloat(em, src[i], false, cache));
    }
    return ret;
};

transit.impl.writer.emitDouble = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitDouble(em, src[i], false, cache));
    }
    return ret;
};

transit.impl.writer.emitChars = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(transit.impl.writer.marshal(em, src[i], false, cache));
    }
    return ret;
};

transit.impl.writer.emitBooleans = function(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitBoolean(em, src[i], false, cache));
    }
    return ret;
};

transit.impl.writer.emitObjects = function(em, iterable, cache) {
    var ret = [];
    if(Array.isArray(iterable)) {
        for(var i = 0; i < iterable.length; i++) {
            ret.push(transit.impl.writer.marshal(em, iterable[i], false, cache));
        }
    } else {
        iterable.forEach(function(v, i) {
            ret.push(transit.impl.writer.marshal(em, v, false, cache));
        });
    }
    return ret;
};

transit.impl.writer.emitArray = function(em, iterable, skip, cache) {
    if(iterable instanceof Int8Array) {
        return transit.impl.writer.emitChars(em, iterable, cache);
    } else if(iterable instanceof Int16Array) {
        return transit.impl.writer.emitShorts(em, iterable, cache);
    } else if(iterable instanceof Int32Array) {
        return transit.impl.writer.emitInts(em, iterable, cache);
    } else if(iterable instanceof Float32Array) {
        return transit.impl.writer.emitFloats(em, iterable, cache);
    } else if(iterable instanceof Float64Array) {
        return transit.impl.writer.emitDoubles(em, iterable, cache);
    } else {
        return transit.impl.writer.emitObjects(em, iterable, cache);
    }
};

transit.impl.writer.emitMap = function(em, obj, skip, cache) {
    var ret = {},
        ks  = Object.keys(obj);
    for(var i = 0; i < ks.length; i++) {
        ret[transit.impl.writer.marshal(em, ks[i], true, cache)] = transit.impl.writer.marshal(em, obj[ks[i]], false, cache);
    }
    return ret;
};

transit.impl.writer.emitTaggedMap = function(em, tag, rep, skip, cache) {
    var ret = {};
    ret[em.emitString(d.ESC_TAG, tag, "", true, cache)] = marshal(em, rep, false, cache);
    return ret;
};

transit.impl.writer.emitEncoded = function(em, h, tag, obj, asMapKey, cache) {
    if(tag.length === 1) {
        var rep = h.rep(obj);
        if(typeof rep === "string") {
            return em.emitString(d.ESC, tag, rep, asMapKey, cache);
        } else if((asMapKey === true) || em.prefersStrings()) {
            rep = h.stringRep(obj);
            if(typeof rep === "string") {
                return em.emitString(d.ESC, tag, rep, asMapKey, cache);
            } else {
                var err = new Error("Cannot be encoded as string");
                err.data = {tag: tag, rep: rep, obj: obj};
                throw err;
            }
        } else {
            return transit.impl.writer.emitTaggedMap(em, tag, rep, asMapKey, cache);
        }
    } else if (asMapKey === true) {
        var err = new Error("Cannot be used as map key");
        err.data = {tag: tag, rep: rep, obj: obj};
        throw err;
    } else {
        return transit.impl.writer.emitTaggedMap(em, tag, h.rep(obj), asMapKey, cache);
    }
}

transit.impl.writer.marshal = function(em, obj, asMapKey, cache) {
    var h   = em.handler(obj),
        tag = h ? h.tag(obj) : null,
        rep = h ? h.rep(obj) : null;

    if(h != null && tag != null) {
        switch(tag) {
        case "_":
            return em.emitNil(asMapKey, cache);
            break;
        case "s":
            return em.emitString("", "", escape(rep), asMapKey, cache);
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
            return emitArray(em, rep, asMapKey, cache);
            break;
        case "map":
            return emitMap(em, rep, asMapKey, cache);
            break;
        default:
            return emitEncoded(em, h, tag, obj, asMapKey, cache);
            break;
        }
    } else {
        var err = new Error("Not supported");
        err.data = {obj: obj, type: transit.handlers.constructor(obj).name};
        throw err;
    }
};

transit.impl.writer.maybeQuoted = function(em, obj) {
    var h = em.handler(obj);

    if(h != null) {
        if(h.tag(obj).length === 1) {
            return t.quoted(obj);
        } else {
            return obj;
        }
    } else {
        var err = new Error("Not supported");
        err.data = {obj: obj, type: transit.handlers.constructor(obj).name};
        throw err;
    }
};

transit.impl.writer.marshalTop = function(em, obj, cache) {
    return JSON.stringify(transit.impl.writer.marshal(em, transit.impl.writer.maybeQuoted(em, obj), false, cache));
};

/**
 * @constructor
 */
transit.impl.writer.Writer = function(marshaller, options) {
    this.marshaller = marshaller;
    this.options = options || {};
    this.cache = this.options.cache ? this.options.cache : new transit.caching.WriteCache();
};

transit.impl.writer.Writer.prototype.write = function(obj) {
    var ret = transit.impl.writer.marshalTop(this.marshaller, obj, this.cache)
    this.cache.clear();
    return ret;
};

transit.impl.writer.Writer.prototype.register = function(type, handler) {
    this.marshaller.registerHandler(type, handler);
};
