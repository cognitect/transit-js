"use strict";

var url    = require("url"),
    longjs = require("long"),
    eq     = require("./eq"),
    transit$guid = 0;

if(typeof Set == "undefined") {
  var Set = require("es6-set");
}

if(typeof Map == "undefined") {
  var Map = require("es6-map");
}


function nullValue() {
  return null;
}

function boolValue(s) {
  return s === "t";
}

function intValue(s) {
  return longjs.fromString(s, false, 10);
}

function floatValue(s) {
  return parseFloat(s);
}

function charValue(s) {
  return s;
}

function Keyword(name) {
  this.name = name;
  this.hashCode = -1;
}

Keyword.prototype = {
  com$cognitect$transit$equals: function(other) {
    return (other instanceof Keyword) && this.name == other.name;
  },
  com$cognitect$transit$hashCode: function() {
    if(this.hashCode !== -1) {
      return this.hashCode;
    } else {
    }
  }
};

function keyword(s) {
  return new Keyword(s);
}

function Symbol(name) {
  this.name = name;
  this.hashCode = -1;
}

Symbol.prototype = {
  com$cognitect$transit$equals: function(other) {
    return (other instanceof Symbol) && this.name == other.name;
  },
  com$cognitect$transit$hashCode: function() {
    if(this.hashCode !== -1) {
      return this.hashCode;
    } else {
    }
  }
};

function symbol(s) {
  return new Symbol(s);
}

function UUID(str) {
  this.str = str;
  this.hashCode = -1;
}

UUID.prototype = {
  com$cognitect$transit$equals: function(other) {
    return (other instanceof UUID) && this.str == other.str;
  },
  com$cognitect$transit$hashCode: function() {
    if(this.hashCode !== -1) {
      return this.hashCode;
    } else {
    }
  }
};

function uuid(s) {
  return new UUID(s);
}

function set(arr) {
  return new Set(arr);
}

function list(xs) {
  return xs;
}

function date(s) {
  return new Date(s);
}

function byteBuffer(data) {
  return new ByteBuffer(data);
}

function uri(s) {
  return url.parse(s);
}

function ints(xs) {
  return xs;
}

function longs(xs) {
  return xs;
}

function floats(xs) {
  return xs;
}

function doubles(xs) {
  return xs;
}

function bools(xs) {
  return xs;
}  

function cmap(xs) {
  var m = new Map();
  for(var i = 0; i < xs.length; i += 2) {
    m.set(xs[i], xs[i+1]);
  }
  return m;
}

function TaggedValue(tag, value) {
  this.tag = tag;
  this.value = value;
}

function taggedValue(tag, value) {
  return new TaggedValue(tag, value);
}

module.exports = {
  nullValue: nullValue,
  boolValue: boolValue,
  intValue: intValue,
  floatValue: floatValue,
  charValue: charValue,
  keyword: keyword,
  Keyword: Keyword,
  symbol: symbol,
  Symbol: Symbol,
  uuid: uuid,
  UUID: UUID,
  set: set,
  Set: Set,
  cmap: cmap,
  Map: Map,
  date: date,
  byteBuffer: byteBuffer,
  uri: uri,
  list: list,
  ints: ints,
  longs: longs,
  floats: floats,
  doubles: doubles,
  bools: bools,
  taggedValue: taggedValue,
  TaggedValue: TaggedValue
};
