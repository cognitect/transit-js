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

/*
var OBJECT = 0,
    ARRAY = 1,
    OBJECT_KEY = 2,
    OBJECT_VALUE = 3,
    OBJECT_FIRST_KEY = 4,
    ARRAY_FIRST_VALUE = 5;
*/

var OBJECT = "object",
    ARRAY = "array",
    OBJECT_KEY = "object_key",
    OBJECT_VALUE = "object_value",
    OBJECT_FIRST_KEY = "object_first_key",
    ARRAY_FIRST_VALUE = "array_first_value";

function JSONMarshaller(stream, options) {
  this.stream = stream || sb.stringBuilder();
  this.state = [];
  this.handlers = h.handlers();
  this._prefersStrings = options ? options.prefersString || false : true;
}

JSONMarshaller.prototype = {
  getState: function() {
    return this.state[this.state.length-1];
  },

  pushState: function(newState) {
    var oldState = this.getState();
    this.state.push(newState);

    if(oldState === ARRAY) {
      this.stream.write(",");
    }

    switch(newState) {
      case ARRAY:
        this.state.push(ARRAY_FIRST_VALUE);
        this.stream.write("[");
        break;
      case OBJECT:
        this.state.push(OBJECT_FIRST_KEY);
        this.stream.write("{");
        break;
      default:
        var err = new Error("JSONMarshaller: Invalid pushState, " + state);
        err.data = {state: state};
        throw err;
        break;
    }
  },

  popState: function() {
    var state = this.state.pop();

    while(state !== OBJECT && state !== ARRAY) {
      state = this.state.pop();
    }

    switch(state) {
      case ARRAY:
        this.stream.write("]");
        return ARRAY;
        break;
      case OBJECT:
        this.stream.write("}");
        return OBJECT;
        break;
      default:
        var err = new Error("JSONMarshaller: Popped unknown state " + state);
        err.data = {state: state}
        throw err;
        break;
    }
  },

  pushKey: function(obj) {
    var state = this.getState();
    switch(state) {
      case OBJECT_KEY:
        this.stream.write(",");
      case OBJECT_FIRST_KEY:
        this.state.pop();
        this.state.push(OBJECT_VALUE);
        this.stream.write(obj);
        break;
      default:
        var err = new Error("JSONMarshaller: Cannot pushKey in state " + state);
        err.data = {state: state};
        throw err;
        break;
    }
    this.stream.write(":");
  },

  pushValue: function(obj) {
    var state = this.getState();
    switch(state) {
      case ARRAY:
        this.stream.write(",");
        this.stream.write(obj);
        break;
      case ARRAY_FIRST_VALUE:
        this.state.pop();
        this.stream.write(obj);
        break;
      case OBJECT_VALUE:
        this.state.pop();
        this.stream.write(obj);
        this.state.push(OBJECT_KEY);
        break;
      default:
        this.stream.write(obj);
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
    if(asMapKey) {
      this.writeObject(s, asMapKey);
    } else {
      this.writeObject(s, asMapKey);
    }
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
    if(asMapKey || (typeof i == "string") || (i > JSON_INT_MAX) || (i < JSON_INT_MIN)) {
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
    this.emitBinary(d.ESC, "b", new Buffer(b).toString("base64"), asMapKey, cache);
  },

  emitArrayStart: function(size) {
    this.pushState(ARRAY);
  },

  emitArrayEnd: function() {
    var lastState = this.popState();
    if(lastState !== ARRAY) {
      throw new Error("JSONMarshaller: Invalid array end");
    }
  },

  emitMapStart: function(size) {
    this.pushState(OBJECT);
  },

  emitMapEnd: function() {
    var lastState = this.popState();
    if(lastState !== OBJECT) {
      throw new Error("JSONMarshaller: Invalid object end");
    }
  },

  emitQuoted: function(obj, cache) {
    this.emitMapStart();
    this.emitString(d.ESC, "'", "", true, cache);
    marshal(this, obj, false, cache);
    this.emitMapEnd();
  },

  flushWriter: function(ignore) {
    this.state = [];
    return this.stream.flush();
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

function emitObjects(em, src, cache) {
  for(var i = 0; i < src.length; i++) {
    marshal(em, src[i], false, cache);
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
    } else if(asMapKey || em.prefersStrings()) {
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
  } else if (asMapKey) {
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

  if(h && tag) {
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
    if(h.tag(obj).length == 1) {
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

function Writer(marshaller, stm, options) {
  this.marshaller = marshaller
  this.stm = stm;
  this.options = options;
}

Writer.prototype = {
  register: function(type, handler) {
    this.marshaller.registerHandler(type, handler);
  }
};

function writer(out, type, opts) {
  if(type === "json") {
    var marshaller = new JSONMarshaller(out, opts);
    return new Writer(marshaller, out, opts);
  } else {
    var err = new Error("Type must be \"json\"");
    err.data = {type: type};
    throw err;
  }
}

function write(writer, obj) {
  marshalTop(writer.marshaller, writer, obj, caching.writeCache());
}

module.exports = {
  writer: writer,
  write: write,
  marshal: marshal,
  marshalTop: marshalTop,
  emitTaggedMap: emitTaggedMap,
  JSONMarshaller: JSONMarshaller
};
