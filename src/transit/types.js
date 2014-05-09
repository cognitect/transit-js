// Copyright (c) Cognitect, Inc.
// All rights reserved.
  
"use strict";

var url    = require("url"),
    longjs = require("long"),
    eq     = require("./eq");

if(typeof Set == "undefined") {
  var Set = require("es6-set");
}

/*
if(typeof Map == "undefined") {
  var Map = require("es6-map");
}
*/

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

Keyword.prototype.com$cognitect$transit$equals = function(other) {
  return (other instanceof Keyword) && this.name == other.name;
};

Keyword.prototype.com$cognitect$transit$hashCode = function() {
  if(this.hashCode !== -1) {
    return this.hashCode;
  } else {
    this.hashCode = eq.hashCode(this.name);
    return this.hashCode;
  }
}

function keyword(s) {
  return new Keyword(s);
}

function Symbol(name) {
  this.name = name;
  this.hashCode = -1;
}

Symbol.prototype.com$cognitect$transit$equals = function(other) {
  return (other instanceof Symbol) && this.name == other.name;
}

Symbol.prototype.com$cognitect$transit$hashCode = function() {
  if(this.hashCode !== -1) {
    return this.hashCode;
  } else {
    this.hashCode = eq.hashCode(this.name);
    return this.hashCode;
  }
}

function symbol(s) {
  return new Symbol(s);
}

function UUID(str) {
  this.str = str;
  this.hashCode = -1;
}

UUID.prototype.com$cognitect$transit$equals = function(other) {
  return (other instanceof UUID) && this.str == other.str;
};

UUID.prototype.com$cognitecat$transit$hashCode = function() {
  if(this.hashCode !== -1) {
    return this.hashCode;
  } else {
    this.hashCode = eq.hashCode(this.str);
    return this.hashCode;
  }
};

function uuid(s) {
  return new UUID(s);
}

Set.prototype.com$cognitect$transit$equals = function(other) {
}

Set.prototype.com$cognitect$transit$hashCode = function(other) {
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

Date.prototype.com$cognitect$transit$equals = function(other) {
  if(other instanceof Date) {
    return this.valueOf() === other.valueOf();
  } else {
    return false;
  }
}

Date.prototype.com$cognitect$transit$hashCode = function() {
  return this.valueOf();
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

function TransitMap(map, size) {
  this.map = map;
  this.size = size;
  this.hashCode = -1;
}

TransitMap.prototype.clear = function() {
    throw new Error("Unsupported operation: clear");
};

TransitMap.prototype.delete = function() {
  throw new Error("Unsupported operation: delete");
};

TransitMap.prototype.entries = function() {
  throw new Error("Unsupported operation: entries");
};

TransitMap.prototype.forEach = function(callback) {
  for(var code in this.map) {
    var vals = this.map[code];
    for(var j = 0; j < vals.length; j+=2) {
      callback(vals[j], vals[j+1], this);
    }
  }
};
  
TransitMap.prototype.get = function(k) {
  var code = eq.hashCode(k),
      vals = this.map[code];
  if(vals != null) {
    for(var i = 0; i < vals.length; i+=2) {
      if(eq.equals(k,vals[i])) {
        return vals[i+1];
      }
    }
  } else {
    return null;
  } 
};

TransitMap.prototype.has = function(k) {
  var code = eq.hashCode(k),
      vals = this.map[code];
  if(vals !== null) {
    for(var i = 0; i < vals.length; i+=2) {
      if(eq.equals(k,vals[i])) {
        return true;
      }
    }
  } else {
    return false;
  }
};

TransitMap.prototype.keys = function() {
  throw new Error("Unsupported operation: keys");
};
  
TransitMap.prototype.set = function(k, v) {
  throw new Error("Unsupported operation: set");
};

TransitMap.prototype.values = function() {
  throw new Error("Unsupported operation: value");
};
  
TransitMap.prototype.com$cognitect$transit$hashCode = function() {
  if(this.hashCode != -1) return this.hashCode;
  this.hashCode = eq.hashMapLike(this);
  return this.hashCode;
};
  
TransitMap.prototype.com$cognitect$transit$equals = function(other) {
  if((other instanceof TransitMap) &&
     (this.size === other.size)) {
    for(var code in this.map) {
      var vals = this.map[code];
      for(var j = 0; j < vals.length; j++) {
        if(!eq.equals(vals[j+1], other.get(vals[j]))) {
          return false;
        }
      }
    }
  } else {
    return false;
  }
};

function transitMap(arr) {
  var map = {};
  for(var i = 0; i < arr.length; i+=2) {
    var code = eq.hashCode(arr[i]),
        vals = map[code];
    if(vals == null) {
      map[code] = [arr[i], arr[i+1]];
    } else {
      var newEntry = true;
      for(var j = 0; j < vals.length; j+= 2) {
        if(eq.equals(vals[j], arr[i])) {
          vals[j] = arr[i+1];
          newEntry = false;
          break;
        }
      }
      if(newEntry) {
        vals.push(arr[i]);
        vals.push(arr[i+1]);
      }
    }
  }
  return new TransitMap(map, arr.length / 2);
}

function cmap(xs) {
  var m = new Map();
  for(var i = 0; i < xs.length; i += 2) {
    m.set(xs[i], xs[i+1]);
  }
  return m;
}

function AsTag(tag, rep, str) {
  this.tag = tag;
  this.rep = rep;
  this.str = str;
}

function asTag(tag, rep, str) {
  return new AsTag(tag, rep, str);
}

function Quote(obj) {
  this.obj = obj;
}

function quoted(obj) {
  return new Quote(obj);
}

function TaggedValue(tag, rep) {
  this.tag = tag;
  this.rep = rep;
}

function TaggedValue(tag, value) {
  this.tag = tag;
  this.value = value;
}

function taggedValue(tag, value) {
  return new TaggedValue(tag, value);
}

function LinkedList(head, tail) {
  this.head = head;
  this.tail = tail;
}

function cons(x, tail) {
  return new LinkedList(x, tail);
};

function Queue() {
  this.list = null;
}

Queue.prototype.peek = function() {
  if(this.list) {
    return this.list.head;
  } else {
    return null;
  }
};

Queue.prototype.push = function(x) {
  this.list = cons(x, this.list);
};

Queue.prototype.pop = function(x) {
  if(this.list) {
    var ret = this.list.head;
    this.list = this.list.tail;
    return ret;
  } else {
    return null;
  }
};

function queue() {
  return new Queue();
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
  //Map: Map,
  TransitMap: TransitMap,
  transitMap: transitMap,
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
  TaggedValue: TaggedValue,
  asTag: asTag,
  AsTag: AsTag,
  quoted: quoted,
  Quote: Quote,
  queue: queue,
  Queue: Queue
};
