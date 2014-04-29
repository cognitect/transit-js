var writeCache = require("./writeCache"),
    d          = require("./delimiters");

var JSON_INT_MAX = Math.pow(2, 53);
var JSON_INT_MIN = -JSON_INT_MAX;

function JSONMarshaller() {
  this.buffer = [];
}

JSONMarshaller.prototype = {
  write: function(c) {
    this.buffer.push(c);
  },

  emitNil: function(asMapKey, cache) {
  },

  emitString: function(asMapKey, prefix, tag, s, asMapKey, cache) {
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

  emitDouble: function(asMapKey, cache) {
  },

  emitBinary: function(asMapKey, cache) {
  },

  arraySize: function(arr) {
  },

  emitArrayStart: function(size) {
    this.write("[");
  },

  emitArrayEnd: function() {
    this.write("]");
  },

  mapSize: function(m) {
  },

  emitMapStart: function(size) {
    this.write("{");
  },

  emitMapEnd: function() {
    this.write("}");
  },

  emitQuoted: function(obj, cache) {
  },

  flushWriter: function(stm) {
  },

  prefersString: function() {
  }
};

function emitInts(em, src, cache) {
  for(var i = 0; i < src.length; i++) {
    em.emitInt(em, src[0], false, cache);
  }
}

function emitShorts(em, src, cache) {
  for(var i = 0; i < src.length; i++) {
    em.emitShort(em, src[0], false, cache);
  }
}

function emitLongs(em, src, cache) {
  for(var i = 0; i < src.length; i++) {
    em.emitLong(em, src[0], false, cache);
  }
}

function emitFloats(em, src, cache) {
  for(var i = 0; i < src.length; i++) {
    em.emitFloat(em, src[0], false, cache);
  }
}

function emitDouble(em, src, cache) {
  for(var i = 0; i < src.length; i++) {
    em.emitDouble(em, src[0], false, cache);
  }
}

function emitChars(em, src, cache) {
  for(var i = 0; i < src.length; i++) {
    marshal(em, src[0], false, cache);
  }
}

function emitBooleans(em, src, cache) {
  for(var i = 0; i < src.length; i++) {
    em.emitBoolean(em, src[0], false, cache);
  }
}

function emitObjects(em, src, cache) {
  for(var i = 0; i < src.length; i++) {
    marshal(em, src[0], false, cache);
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

function emitMap(em, iterable, skip, cache) {
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

function marshal() {
}

function maybeQuoted(obj) {
}

function marshalTop() {
}

function getItfHandler(ty) {
}

function getBaseHandler(ty) {
}

function handler(obj) {
}

function write(writer, obj) {
  marshalTop(m, writer, obj, writeCache());
}

module.exports = {
  write: write,
  JSONMarshaller: JSONMarshaller
};
