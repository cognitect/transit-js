// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var caching = require("./caching"),
    h       = require("./handlers"),
    d       = require("./delimiters");

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

function JSONMarshaller(options) {
  this.state = [];
  this.handlers = (options && options.handlers) || {};
  this.buffer = [];
}

JSONMarshaller.prototype = {
  defaultHandlers: h.defaultHandlers,

  getState: function() {
    return this.state[this.state.length-1];
  },

  pushState: function(newState) {
    this.state.push(newState);
    switch(newState) {
      case "array":
        this.state.push("array_first_value");
        this.write("[");
        break;
      case "object":
        this.state.push("object_first_key");
        this.write("{");
        break;
      default:
        throw new Error("JSONMarshaller: Invalid pushState " + state);
        break;
    }
  },

  popState: function() {
    var state = this.getState();

    while(state !== "object" && state !== "array") {
      state = this.state.pop();
    }
    
    switch(state) {
      case "array":
        this.write("]");
        return "array"
        break;
      case "object":
        this.write("}");
        return "object"
        break;
      default:
        throw new Error("JSONMarshaller: Popped unknown state " + state);
        break;
    }
  },

  pushKey: function(obj) {
    var state = this.getState();
    switch(state) {
      case "object_key":
        this.write(",");
      case "object_first_key":
        this.state.pop();
        this.state.push("object_value");
        this.write(obj);
        break;
      default:
        throw new Error("JSONMarshaller: Cannot pushKey in state " + state);
        break;
    }
    this.write(":");
  },

  pushValue: function(obj) {
    var state = this.getState();
    switch(state) {
      case "array":
        this.write(",");
      case "array_first_value":
        this.state.pop();
        this.write(obj);
        break;
      case "object_value":
        this.state.pop();
        this.write(obj);
        this.state.push("object_key");
      default:
        break;
    }
  },

  mapSize: function(ignore) {
  },

  handler: function(obj) {
    var t = obj == null ? "null" : h.typeTag(obj.constructor);
    return this.handlers[t] || this.defaultHandlers[t];
  },

  registerHandler: function(ctor) {
    var t = h.typeTag(ctor);
    defaultHandlers[t] = handler;
  },

  write: function(c) {
    this.buffer.push(c);
  },

  emitNil: function(asMapKey, cache) {
    if(asMapKey) {
      this.emitString(d.ESC, "_", null, asMapKey, cache);
    } else {
      this.write("null");
    }
  },

  emitString: function(prefix, tag, s, asMapKey, cache) {
    var s = cache.write(prefix+tag+s, asMapKey);
    if(asMapKey) {
      this.write("\""+s+"\":");
    } else {
      this.write(s);
    }
  },

  emitBoolean: function(b, asMapKey, cache) {
    var s = b.toString();
    if(asMapKey) {
      this.emitString(d.ESC, "?", s[0], asMapKey, cache);
    } else {
      this.write(s);
    }
  },

  emitInteger: function(i, asMapKey, cache) {
    if(asMapKey || (typeof i == "string") || (i > JSON_INT_MAX) || (i < JSON_INT_MAX)) {
      this.emitString(d.ESC, "i", i, asMapKey, cache);
    } else {
      this.write(s);
    }
  },

  emitDouble: function(d, asMapKey, cache) {
    if(asMapKey) {
      this.emitString(d.ESC, "d", d, asMapKey, cache);
    } else {
      this.write(s);
    }
  },

  emitBinary: function(b, asMapKey, cache) {
    this.emitBinary(d.ESC, "b", new Buffer(b).toString("base64"), asMapKey, cache);
  },

  arraySize: function(arr) {
  },

  emitArrayStart: function(size) {
    var lastState = this.pushState("array");
  },

  emitArrayEnd: function() {
    var lastState = this.popState();
    if(lastState !== "array") {
      throw new Error("JSONMarshaller: Invalid array end");
    }
  },

  emitMapStart: function(size) {
    this.pushState("object");
  },

  emitMapEnd: function() {
    this.popState();
  },

  emitQuoted: function(obj, cache) {
    this.emitMapStart(1);
    this.emitString(d.ESC, "'", null, true, cache);
    marshal(this, obj, false, cache);
    this.emitMapEnd();
  },

  flush: function(ignore) {
    var ret = this.buffer.join("");
    this.buffer = [];
    return ret;
  },

  prefersString: function() {
    return true;
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

function emitObjects(em, src, cache) {
  for(var i = 0; i < src.length; i++) {
    marshal(em, src[i], false, cache);
  }
}

function emitArray(em, iterable, skip, cache) {
  em.emitArrayStart(em.arraySize(iterable));
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
  }
  em.emitMapEnd();
}

function AsTag(tag, rep, str) {
  this.tag = tag;
  this.rep = rep;
  this.str = str;
}

function Quote(obj) {
  this.obj = obj;
}

function TaggedValue(tag, rep) {
  this.tag = tag;
  this.rep = rep;
}

function hasStringableKeys(m) {
}

function emitTaggedMap(em, tag, rep, skip, cache) {
}

function emitEncoded(em, h, tag, obj, asMapKey, cache) {
}

function toBoolean(x) {
}

function marshal(em, obj, asMapKey, cache) {
  var h   = em.handler(obj);
      tag = h ? h.tag(o) : null,
      rep = h ? h.rep(o) : null;

  if(h && tag) {
    switch(tag) {
      case "_":
        em.emitNil(asMapKey, cache);
        break;
      case "s":
        em.emitString(null, null, escape(rep), asMapKey, cache);
        break;
      case "?":
        em.emitBoolean(toBoolean(rep), asMapKey, cache);
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
        break;
    }
    return emitEncoded(em, h, taga, obj, asMapKey, cache);
  } else {
    throw new Error("Not supported " + obj);
  }
}

function maybeQuoted(em, obj) {
  var h = em.handler(obj);

  if(h != null) {
    if(h.tag(obj).length == 1) {
      return quoted(obj);
    } else {
      return obj;
    }
  } else {
    throw new Error("Not support " + obj);
  }
}

function marshalTop(em, obj, cache) {
  marshal(em, maybeQuoted(em, obj), false, cache);
}

function Writer(obj, type, options) {
  if(options.marshaller) {
    this.marshaller = options.marshaller
  } else {
    if(type === "json") {
      this.marshaller = new JSONMarshaller();
    }
  }
}

Writer.prototype = {
  register: function(type, handler) {
    this.marshaller.registerHandler(type, handler);
  }
};

function writer(obj, type, options) {
  return new Writer(obj, type, options || {});
}

function write(writer, obj) {
  marshalTop(writer.marshaller, writer, obj, caching.writeCache());
}

module.exports = {
  write: write,
  JSONMarshaller: JSONMarshaller
};
