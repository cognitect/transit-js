// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var caching = require("./caching"),
    h       = require("./handlers"),
    t       = require("./types"),
    d       = require("./delimiters"),
    sb      = require("./stringbuilder");

var JSON_INT_MAX = Math.pow(2, 53);
var JSON_INT_MIN = -JSON_INT_MAX;

function escape(string) {
    if(string.length > 0) {
        var c = string[0];
        if(c === d.RES && string[1] === ESC) {
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

var STATES = ["OBJECT", "ARRAY", "OBJECT_KEY", "OBJECT_VALUE",
              "OBJECT_FIRST_KEY", "ARRAY_FIRST_VALUE"];
/*
var OBJECT = 0,
    ARRAY = 1,
    OBJECT_KEY = 2,
    OBJECT_VALUE = 3,
    OBJECT_FIRST_KEY = 4,
    ARRAY_FIRST_VALUE = 5;
*/

function JSONMarshaller(options) {
    this.buffer = (options && options.buffer) || sb.stringBuilder();
    this.state = t.queue();
    this.handlers = h.handlers();
    this._prefersStrings = options ? options.prefersString || false : true;
}

JSONMarshaller.prototype = {
    NO_WRITE: {},

    getState: function() {
        return this.state.peek();
    },

    pushState: function(newState) {
        var oldState = this.getState();
        this.state.push(newState);

        // ARRAY
        if(oldState === 1) {
            this.buffer.write(",");
        }

        switch(newState) {
        // ARRAY
        case 1:
            this.state.push(5); // ARRAY_FIRST_VALUE
            this.buffer.write("[");
            break;
        // OBJECT
        case 0:
            this.state.push(4); // OBJECT_FIRST_KEY
            this.buffer.write("{");
            break;
        default:
            var err = new Error("JSONMarshaller: Invalid pushState, " + STATES[newState]);
            err.data = {state: newState};
            throw err;
            break;
        }
    },

    popState: function() {
        var state = this.state.pop();

        // while !OBJECT && !ARRAY
        while(state !== 0 && state !== 1) {
            state = this.state.pop();
        }

        switch(state) {
        // ARRAY
        case 1:
            this.buffer.write("]");
            break;
        // OBJECT
        case 0:
            this.buffer.write("}");
            break;
        default:
            var err = new Error("JSONMarshaller: Popped unknown state " + STATES[state]);
            err.data = {state: state};
            throw err;
            break;
        }

        this.pushValue(this.NO_WRITE);

        return state;
    },

    // a debugging helper, pour state queue into an array & reverse
    debugState: function() {
        var l   = this.state.list,
            ret = [];
        while(l) {
            ret.push(STATES[l.head]);
            l = l.tail;
        }
        return ret.reverse();
    },

    pushKey: function(obj) {
        var state = this.getState();
        switch(state) {
        // OBJECT_KEY
        case 2:
            this.buffer.write(",");
        // OBJECT_FIRST_KEY
        case 4:
            this.state.pop();
            this.state.push(3); // OBJECT_VALUE
            this.buffer.write(obj);
            break;
        default:
            var err = new Error("JSONMarshaller: Cannot pushKey in state " + STATES[state] + " " + obj);
            err.data = {state: state};
            throw err;
            break;
        }
        this.buffer.write(":");
    },

    pushValue: function(obj) {
        var state = this.getState();
        switch(state) {
        // ARRAY
        case 1:
            if(obj !== this.NO_WRITE) {
                this.buffer.write(",");
                this.buffer.write(obj);
            }
            break;
        // ARRAY_FIRST_VALUE
        case 5:
            this.state.pop();
            if(obj !== this.NO_WRITE) {
                this.buffer.write(obj);
            }
            break;
        // OBJECT_VALUE
        case 3:
            this.state.pop();
            if(obj !== this.NO_WRITE) {
                this.buffer.write(obj);
            }
            this.state.push(2);
            break;
        default:
            if(obj !== this.NO_WRITE) {
                this.buffer.write(obj);
            }
            break;
        }
    },

    handler: function(obj) {
        return this.handlers.get(h.constructor(obj));
    },

    registerHandler: function(ctor, handler) {
        this.handlers.set(ctor, handler);
    },

    writeObject: function(obj, asMapKey) {
        asMapKey = asMapKey || false;
        if(asMapKey) {
            this.pushKey(obj);
        } else {
            this.pushValue(obj);
        }
    },

    emitNil: function(asMapKey, cache) {
        if(asMapKey) {
            this.emitString(d.ESC, "_", "", asMapKey, cache);
        } else {
            this.writeObject("null", false);
        }
    },

    emitString: function(prefix, tag, s, asMapKey, cache) {
        var s = "\""+cache.write(prefix+tag+s, asMapKey)+"\"";
        this.writeObject(s, asMapKey);
    },

    emitBoolean: function(b, asMapKey, cache) {
        var s = b.toString();
        if(asMapKey) {
            this.emitString(d.ESC, "?", s[0], asMapKey, cache);
        } else {
            this.writeObject(s, false);
        }
    },

    emitInteger: function(i, asMapKey, cache) {
        if(asMapKey || (typeof i === "string") || (i > JSON_INT_MAX) || (i < JSON_INT_MIN)) {
            this.emitString(d.ESC, "i", i, asMapKey, cache);
        } else {
            this.writeObject(i);
        }
    },

    emitDouble: function(d, asMapKey, cache) {
        if(asMapKey) {
            this.emitString(d.ESC, "d", d, asMapKey, cache);
        } else {
            this.writeObject(s);
        }
    },

    emitBinary: function(b, asMapKey, cache) {
        this.emitString(d.ESC, "b", b, asMapKey, cache);
    },

    emitArrayStart: function(size) {
        this.pushState(1); // ARRAY
    },

    emitArrayEnd: function() {
        var lastState = this.popState();
        if(lastState !== 1) { // ARRAY
            throw new Error("JSONMarshaller: Invalid array end");
        }
    },

    emitMapStart: function(size) {
        this.pushState(0);
    },

    emitMapEnd: function() {
        var lastState = this.popState();
        if(lastState !== 0) {
            throw new Error("JSONMarshaller: Invalid object end");
        }
    },

    emitQuoted: function(obj, cache) {
        this.emitMapStart();
        this.emitString(d.ESC, "'", "", true, cache);
        marshal(this, obj, false, cache);
        this.emitMapEnd();
    },

    flushBuffer: function(ignore) {
        this.state = t.queue();
        return this.buffer.flush();
    },

    prefersStrings: function() {
        return this._prefersStrings;
    }
};

function emitInts(em, src, cache) {
    for(var i = 0; i < src.length; i++) {
        em.emitInt(em, src[i], false, cache);
    }
}

function emitShorts(em, src, cache) {
    for(var i = 0; i < src.length; i++) {
        em.emitShort(em, src[i], false, cache);
    }
}

function emitLongs(em, src, cache) {
    for(var i = 0; i < src.length; i++) {
        em.emitLong(em, src[i], false, cache);
    }
}

function emitFloats(em, src, cache) {
    for(var i = 0; i < src.length; i++) {
        em.emitFloat(em, src[i], false, cache);
    }
}

function emitDouble(em, src, cache) {
    for(var i = 0; i < src.length; i++) {
        em.emitDouble(em, src[i], false, cache);
    }
}

function emitChars(em, src, cache) {
    for(var i = 0; i < src.length; i++) {
        marshal(em, src[i], false, cache);
    }
}

function emitBooleans(em, src, cache) {
    for(var i = 0; i < src.length; i++) {
        em.emitBoolean(em, src[i], false, cache);
    }
}

function emitObjects(em, iterable, cache) {
    if(Array.isArray(iterable)) {
        for(var i = 0; i < iterable.length; i++) {
            marshal(em, iterable[i], false, cache);
        }
    } else {
        iterable.forEach(function(v, i) {
            marshal(em, v, false, cache);
        });
    }
}

function emitArray(em, iterable, skip, cache) {
    em.emitArrayStart();
    if(iterable instanceof Int8Array) {
        emitChars(em, iterable, cache);
    } else if(iterable instanceof Int16Array) {
        emitShorts(em, iterable, cache);
    } else if(iterable instanceof Int32Array) {
        emitInts(em, iterable, cache);
    } else if(iterable instanceof Float32Array) {
        emitFloats(em, iterable, cache);
    } else if(iterable instanceof Float64Array) {
        emitDoubles(em, iterable, cache);
    } else {
        emitObjects(em, iterable, cache);
    }
    em.emitArrayEnd();
}

function emitMap(em, obj, skip, cache) {
    em.emitMapStart();
    var ks = Object.keys(obj);
    for(var i = 0; i < ks.length; i++) {
        marshal(em, ks[i], true, cache);
        marshal(em, obj[ks[i]], false, cache);
    }
    em.emitMapEnd();
}

function emitTaggedMap(em, tag, rep, skip, cache) {
    em.emitMapStart();
    em.emitString(d.ESC_TAG, tag, "", true, cache);
    marshal(em, rep, false, cache);
    em.emitMapEnd();
}

function emitEncoded(em, h, tag, obj, asMapKey, cache) {
    if(tag.length === 1) {
        var rep = h.rep(obj);
        if(typeof rep === "string") {
            em.emitString(d.ESC, tag, rep, asMapKey, cache);
        } else if((asMapKey === true) || em.prefersStrings()) {
            rep = h.stringRep(obj);
            if(typeof rep === "string") {
                em.emitString(d.ESC, tag, rep, asMapKey, cache);
            } else {
                var err = new Error("Cannot be encoded as string");
                err.data = {tag: tag, rep: rep, obj: obj};
                throw err;
            }
        } else {
            emitTaggedMap(em, tag, rep, asMapKey, cache);
        }
    } else if (asMapKey === true) {
        var err = new Error("Cannot be used as map key");
        err.data = {tag: tag, rep: rep, obj: obj};
        throw err;
    } else {
        emitTaggedMap(em, tag, h.rep(obj), asMapKey, cache);
    }
}

function marshal(em, obj, asMapKey, cache) {
    var h   = em.handler(obj),
        tag = h ? h.tag(obj) : null,
        rep = h ? h.rep(obj) : null;

    if(h != null && tag != null) {
        switch(tag) {
        case "_":
            em.emitNil(asMapKey, cache);
            break;
        case "s":
            em.emitString("", "", escape(rep), asMapKey, cache);
            break;
        case "?":
            em.emitBoolean(rep, asMapKey, cache);
            break;
        case "i":
            em.emitInteger(rep, asMapKey, cache);
            break;
        case "d":
            em.emitDouble(rep, asMapKey, cache);
            break;
        case "b":
            em.emitBinary(rep, asMapKey, cache);
            break;
        case "'":
            em.emitQuoted(rep, cache);
            break;
        case "array":
            emitArray(em, rep, asMapKey, cache);
            break;
        case "map":
            emitMap(em, rep, asMapKey, cache);
            break;
        default:
            emitEncoded(em, h, tag, obj, asMapKey, cache);
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
    marshal(em, maybeQuoted(em, obj), false, cache);
}

function Writer(marshaller, options) {
    this.marshaller = marshaller;
    this.options = options || {};
    this.cache = this.options.cache ? this.options.cache : caching.writeCache();
}

Writer.prototype = {
    write: function(obj) {
        marshalTop(this.marshaller, obj, this.cache)
        var ret = this.marshaller.flushBuffer();
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
    writer: writer,
    marshal: marshal,
    marshalTop: marshalTop,
    emitTaggedMap: emitTaggedMap,
    JSONMarshaller: JSONMarshaller
};
