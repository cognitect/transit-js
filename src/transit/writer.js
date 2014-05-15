// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var caching = require("./caching"),
    h       = require("./handlers"),
    Long    = require("long"),
    t       = require("./types"),
    d       = require("./delimiters"),
    sb      = require("./stringbuilder");

var JSON_INT_MAX = Long.fromNumber(Math.pow(2, 53));
var JSON_INT_MIN = Long.fromNumber(-JSON_INT_MAX);

function isLong(i) {
    if(i instanceof Long) {
        return i.lessThan(JSON_INT_MIN) || i.greaterThan(JSON_INT_MAX);
    } else {
        return false;
    }
}

function escape(string) {
    if(string.length > 0) {
        var c = string[0];
        if(c === d.RES && string[1] === d.ESC) {
            return string.substring(1);
        } else if(c === d.ESC || c === d.SUB || c === d.RES) {
            return d.ESC+string;
        } else {
            return string;
        }
    }
    return null;
}

// STATES

function JSONMarshaller(options) {
    this.buffer = (options && options.buffer) || sb.stringBuilder();
    this.handlers = h.handlers();
    this._prefersStrings = options ? options.prefersString || false : true;
}

JSONMarshaller.prototype = {
    handler: function(obj) {
        return this.handlers.get(h.constructor(obj));
    },

    registerHandler: function(ctor, handler) {
        this.handlers.set(ctor, handler);
    },

    emitNil: function(asMapKey, cache) {
        if(asMapKey) {
            return this.emitString(d.ESC, "_", "", asMapKey, cache);
        } else {
            return null;
        }
    },

    emitString: function(prefix, tag, s, asMapKey, cache) {
        return cache.write(prefix+tag+s, asMapKey);
    },

    emitBoolean: function(b, asMapKey, cache) {
        if(asMapKey) {
            return this.emitString(d.ESC, "?", s[0], asMapKey, cache);
        } else {
            return b;
        }
    },

    emitInteger: function(i, asMapKey, cache) {
        if(asMapKey || (typeof i === "string") || isLong(i)) {
            return this.emitString(d.ESC, "i", i.toString(), asMapKey, cache);
        } else {
            return i;
        }
    },

    emitDouble: function(d, asMapKey, cache) {
        if(asMapKey) {
            return this.emitString(d.ESC, "d", d, asMapKey, cache);
        } else {
            return d;
        }
    },

    emitBinary: function(b, asMapKey, cache) {
        return this.emitString(d.ESC, "b", b, asMapKey, cache);
    },

    emitQuoted: function(obj, cache) {
        var ret = {},
            k   = this.emitString(d.ESC_TAG, "'", "", true, cache);
        ret[k] = marshal(this, obj, false, cache);
        return ret;
    },

    prefersStrings: function() {
        return this._prefersStrings;
    }
};

function emitInts(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitInt(em, src[i], false, cache));
    }
    return ret;
}

function emitShorts(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitShort(em, src[i], false, cache));
    }
    return ret;
}

function emitLongs(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitLong(em, src[i], false, cache));
    }
    return ret;
}

function emitFloats(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitFloat(em, src[i], false, cache));
    }
    return ret;
}

function emitDouble(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitDouble(em, src[i], false, cache));
    }
    return ret;
}

function emitChars(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(marshal(em, src[i], false, cache));
    }
    return ret;
}

function emitBooleans(em, src, cache) {
    var ret = [];
    for(var i = 0; i < src.length; i++) {
        ret.push(em.emitBoolean(em, src[i], false, cache));
    }
    return ret;
}

function emitObjects(em, iterable, cache) {
    var ret = [];
    if(Array.isArray(iterable)) {
        for(var i = 0; i < iterable.length; i++) {
            ret.push(marshal(em, iterable[i], false, cache));
        }
    } else {
        iterable.forEach(function(v, i) {
            ret.push(marshal(em, v, false, cache));
        });
    }
    return ret;
}

function emitArray(em, iterable, skip, cache) {
    if(iterable instanceof Int8Array) {
        return emitChars(em, iterable, cache);
    } else if(iterable instanceof Int16Array) {
        return emitShorts(em, iterable, cache);
    } else if(iterable instanceof Int32Array) {
        return emitInts(em, iterable, cache);
    } else if(iterable instanceof Float32Array) {
        return emitFloats(em, iterable, cache);
    } else if(iterable instanceof Float64Array) {
        return emitDoubles(em, iterable, cache);
    } else {
        return emitObjects(em, iterable, cache);
    }
}

function emitMap(em, obj, skip, cache) {
    var ret = {};
    var ks = Object.keys(obj);
    for(var i = 0; i < ks.length; i++) {
        ret[marshal(em, ks[i], true, cache)] = marshal(em, obj[ks[i]], false, cache);
    }
    return ret;
}

function emitTaggedMap(em, tag, rep, skip, cache) {
    var ret = {};
    ret[em.emitString(d.ESC_TAG, tag, "", true, cache)] = marshal(em, rep, false, cache);
    return ret;
}

function emitEncoded(em, h, tag, obj, asMapKey, cache) {
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
            return emitTaggedMap(em, tag, rep, asMapKey, cache);
        }
    } else if (asMapKey === true) {
        var err = new Error("Cannot be used as map key");
        err.data = {tag: tag, rep: rep, obj: obj};
        throw err;
    } else {
        return emitTaggedMap(em, tag, h.rep(obj), asMapKey, cache);
    }
}

function marshal(em, obj, asMapKey, cache) {
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
        err.data = {obj: obj, type: h.constructor(obj).name};
        throw err;
    }
}

function maybeQuoted(em, obj) {
    var h = em.handler(obj);

    if(h != null) {
        if(h.tag(obj).length === 1) {
            return t.quoted(obj);
        } else {
            return obj;
        }
    } else {
        var err = new Error("Not supported");
        err.data = {obj: obj, type: h.constructor(obj).name};
        throw err;
    }
}

function marshalTop(em, obj, cache) {
    return JSON.stringify(marshal(em, maybeQuoted(em, obj), false, cache));
}

function Writer(marshaller, options) {
    this.marshaller = marshaller;
    this.options = options || {};
    this.cache = this.options.cache ? this.options.cache : caching.writeCache();
}

Writer.prototype = {
    write: function(obj) {
        var ret = marshalTop(this.marshaller, obj, this.cache)
        this.cache.clear();
        return ret;
    },

    register: function(type, handler) {
        this.marshaller.registerHandler(type, handler);
    }
};

function writer(type, opts) {
    if(type === "json" || type == null) {
        type = "json";
        var marshaller = new JSONMarshaller(opts);
        return new Writer(marshaller, opts);
    } else {
        var err = new Error("Type must be \"json\"");
        err.data = {type: type};
        throw err;
    }
}

module.exports = {
    JSON_INT_MAX: JSON_INT_MAX,
    JSON_INT_MIN: JSON_INT_MIN,
    writer: writer,
    marshal: marshal,
    marshalTop: marshalTop,
    emitTaggedMap: emitTaggedMap,
    JSONMarshaller: JSONMarshaller
};
