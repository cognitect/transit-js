"use strict";

var url    = require("url"),
    longjs = require("long"),
    eq     = require("./eq");

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

function TransitMap(map) {
  this.map = map;
  this.size = map.size;
  this.hashCode = -1;
}

TransitMap.prototype = {
  clear: function() {
    throw new Error("Unsupported operation: clear");
  },

  delete: function() {
    throw new Error("Unsupported operation: delete");
  },

  entries: function() {
    throw new Error("Unsupported operation: entries");
  },

  forEach: function(callback) {
    var ks = this.map.keys();
    for(var i = 0; i < ks.length; i++) {
      var vals = this.map.get(ks[i]);
      for(var j = 0; j < vals.length; j+=2) {
        callback(vals[i], vals[i+1], this);
      }
    }
  },
  
  get: function(k) {
    var code = eq.hashCode(k),
        vals = this.map.get(code);
    if(vals !== null) {
      for(var i = 0; i < vals.length; i+=2) {
        if(eq.equals(k,vals[i])) {
          return vals[i+1];
        }
      }
    } else {
      return null;
    } 
  },

  has: function(k) {
    var code = eq.hashCode(k),
        vals = this.map.get(code);
    if(vals !== null) {
      for(var i = 0; i < vals.length; i+=2) {
        if(eq.equal(k,vals[i])) {
          return true;
        }
      }
    } else {
      return false;
    }
  },

  keys: function() {
    throw new Error("Unsupported operation: keys");
  },
  
  set: function(k, v) {
    throw new Error("Unsupported operation: set");
  },

  values: function() {
    throw new Error("Unsupported operation: value");
  },
  
  com$cognitect$transit$hashCode: function() {
    var code = 0,
        ks   = this.map.keys();
    for(var i = 0; i < ks.length; i++) {
    }
    return code;
  },
  
  com$cognitect$transit$equals: function(other) {
    if((other instanceof TransitMap) &&
       (this.size === other.size)) {
      var ks = this.map.keys();
      for(var i = 0; i < ks.length; i++) {
        var vals = this.map(get(ks[i]));
        for(var j = 0; j < vals.length; j++) {
          if(!eq.equals(vals[j+1], other.get(vals[j]))) {
            return false;
          }
        }
      }
    } else {
      return false;
    }
  }
};

function transitMap(arr) {
  var m = new Map();
  for(var i = 0; i < arr.length; i+=2) {
    var code = eq.hashCode(arr[i]),
        vals = m.get(code);
    if(vals == null) {
      m.set(code, [arr[i], arr[i+1]]);
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
  return new TransitMap(m);
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
  TaggedValue: TaggedValue
};
