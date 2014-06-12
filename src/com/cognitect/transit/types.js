// Copyright (c) Cognitect, Inc.
// All rights reserved.
  
"use strict";

goog.provide("com.cognitect.transit.types");
goog.require("com.cognitect.transit.eq");
goog.require("goog.math.Long");

goog.scope(function() {

var types = com.cognitect.transit.types,
    eq    = com.cognitect.transit.eq,
    Long  = goog.math.Long;

types.nullValue = function() {
    return null;
};

types.boolValue = function(s) {
    return s === "t";
};

/**
 * @constructor
 */
types.Integer = function(str) {
    this.str = str;
};

types.Integer.prototype.toString = function() {
    return "[Integer: "+this.str+"]"
};

types.intValue = function(s) {
    return new types.Integer(s);
};

types.floatValue = function(s) {
    return parseFloat(s);
};

/**
 * @constructor
 */
types.BigDecimal = function(s) {
    this.value = s;
};

types.BigDecimal.prototype.toString = function() {
    return "[BigDecimal: "+this.value+"]";
};

types.bigDecimalValue = function(s) {
    return new types.BigDecimal(s);
};

types.charValue = function(s) {
    return s;
};

/**
 * @constructor
 */
types.Keyword = function(name) {
    this.name = name;
    this.hashCode = -1;
};

types.Keyword.prototype.toString = function() {
    return "[Keyword: "+this.name+"]";
};

types.Keyword.prototype.com$cognitect$transit$equals = function(other) {
    return (other instanceof types.Keyword) && this.name == other.name;
};

types.Keyword.prototype.com$cognitect$transit$hashCode = function() {
    if(this.hashCode !== -1) {
        return this.hashCode;
    } else {
        this.hashCode = eq.hashCode(this.name);
        return this.hashCode;
    }
};

types.keyword = function(s) {
    return new types.Keyword(s);
};

/**
 * @constructor
 */
types.Symbol = function(name) {
    this.name = name;
    this.hashCode = -1;
};

types.Symbol.prototype.toString = function() {
    return "[Symbol: "+this.name+"]";
};

types.Symbol.prototype.com$cognitect$transit$equals = function(other) {
    return (other instanceof types.Symbol) && this.name == other.name;
};

types.Symbol.prototype.com$cognitect$transit$hashCode = function() {
    if(this.hashCode !== -1) {
        return this.hashCode;
    } else {
        this.hashCode = eq.hashCode(this.name);
        return this.hashCode;
    }
};

types.symbol = function(s) {
    return new types.Symbol(s);
};

/**
 * @constructor
 */
types.UUID = function(str) {
    this.str = str;
    this.hashCode = -1;
};

types.UUID.prototype.toString = function() {
    return "[object UUID: "+this.str+"]";
};

types.UUID.prototype.com$cognitect$transit$equals = function(other) {
    return (other instanceof types.UUID) && this.str == other.str;
};

types.UUID.prototype.com$cognitecat$transit$hashCode = function() {
    if(this.hashCode !== -1) {
        return this.hashCode;
    } else {
        this.hashCode = eq.hashCode(this.str);
        return this.hashCode;
    }
};

types.uuid = function(s) {
    return new types.UUID(s);
};

types.date = function(s) {
    return new Date(s);
};

Date.prototype.com$cognitect$transit$equals = function(other) {
    if(other instanceof Date) {
        return this.valueOf() === other.valueOf();
    } else {
        return false;
    }
};

Date.prototype.com$cognitect$transit$hashCode = function() {
    return this.valueOf();
};

/**
 * @constructor
 */
types.Binary = function(str) {
    this.str = str;
};

types.binary = function(str) {
    return new types.Binary(str);
};

/**
 * @constructor
 */
types.URI = function(uri) {
    this.uri = uri;
};

types.URI.prototype.toString = function() {
    return "[URI: "+this.uri+"]";
};

types.uri = function(s) {
    return new types.URI(s);
}

types.ints = function(xs) {
    return xs;
};

types.longs = function(xs) {
    return xs;
};

types.floats = function(xs) {
    return xs;
};

types.doubles = function(xs) {
    return xs;
};

types.bools = function(xs) {
    return xs;
};

/**
 * @constructor
 */
types.TransitMap = function(keys, map, size) {
    this.map = map;
    this.keys = keys;
    this.size = size;
    this.hashCode = -1;
};

types.TransitMap.prototype.toString = function() {
    return "[TransitMap]";
};

types.TransitMap.prototype.clear = function() {
    throw new Error("Unsupported operation: clear");
};
types.TransitMap.prototype["clear"] = types.TransitMap.prototype.clear;

types.TransitMap.prototype['delete'] = function() {
    throw new Error("Unsupported operation: delete");
};

types.TransitMap.prototype.entries = function() {
    throw new Error("Unsupported operation: entries");
};
types.TransitMap.prototype["entries"] = types.TransitMap.prototype.entries;

types.TransitMap.prototype.forEach = function(callback) {
    for(var i = 0; i < this.keys.length; i++) {
        var vals = this.map[this.keys[i]];
        for(var j = 0; j < vals.length; j+=2) {
            callback(vals[j+1], vals[j], this);
        }
    }
};
types.TransitMap.prototype["forEach"] = types.TransitMap.prototype.forEach;

types.TransitMap.prototype.get = function(k) {
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
types.TransitMap.prototype["get"] = types.TransitMap.prototype.get;

types.TransitMap.prototype.has = function(k) {
    var code = eq.hashCode(k),
        vals = this.map[code];
    if(vals != null) {
        for(var i = 0; i < vals.length; i+=2) {
            if(eq.equals(k,vals[i])) {
                return true;
            }
        }
        return false;
    } else {
        return false;
    }
};
types.TransitMap.prototype["has"] = types.TransitMap.prototype.has;

types.TransitMap.prototype.keys = function() {
    throw new Error("Unsupported operation: keys");
};
types.TransitMap.prototype["keys"] = types.TransitMap.prototype.keys;
  
types.TransitMap.prototype.set = function(k, v) {
    throw new Error("Unsupported operation: set");
};
types.TransitMap.prototype["set"] = types.TransitMap.prototype.set;

types.TransitMap.prototype.values = function() {
    throw new Error("Unsupported operation: value");
};
types.TransitMap.prototype["values"] = types.TransitMap.prototype.values;
  
types.TransitMap.prototype.com$cognitect$transit$hashCode = function() {
    if(this.hashCode != -1) return this.hashCode;
    this.hashCode = eq.hashMapLike(this);
    return this.hashCode;
};

types.TransitMap.prototype.com$cognitect$transit$equals = function(other) {
    if((other instanceof types.TransitMap) &&
       (this.size === other.size)) {
        for(var code in this.map) {
            var vals = this.map[code];
            for(var j = 0; j < vals.length; j+=2) {
                if(!eq.equals(vals[j+1], other.get(vals[j]))) {
                    return false;
                }
            }
        }
        return true;
    } else {
        return false;
    }
};

types.map = function(arr) {
    var map  = {},
        keys = [],
        size = 0;
    for(var i = 0; i < arr.length; i+=2) {
        var code = eq.hashCode(arr[i]),
            vals = map[code];
        if(vals == null) {
            keys.push(code);
            map[code] = [arr[i], arr[i+1]];
            size++;
        } else {
            var newEntry = true;
            for(var j = 0; j < vals.length; j+= 2) {
                if(eq.equals(vals[j], arr[i])) {
                    vals[j+1] = arr[i+1];
                    newEntry = false;
                    break;
                }
            }
            if(newEntry) {
                vals.push(arr[i]);
                vals.push(arr[i+1]);
                size++;
            }
        }
    }
    return new types.TransitMap(keys, map, size);
};

types.cmap = function(xs) {
    return types.map(xs);
};

/**
 * @constructor
 */
types.TransitSet = function(map) {
    this.map = map;
    this.size = map.size;
};

types.TransitSet.prototype.toString = function() {
    return "[TransitSet]";
};

types.TransitSet.prototype.add = function(value) {
    throw new Error("Unsupported operation: add");
};
types.TransitSet.prototype["add"] = types.TransitSet.prototype.add;

types.TransitSet.prototype.clear = function() {
    throw new Error("Unsupported operation: clear");
};
types.TransitSet.prototype["clear"] = types.TransitSet.prototype.clear;

types.TransitSet.prototype['delete'] = function(value) {
    throw new Error("Unsupported operation: delete");
};

types.TransitSet.prototype.entries = function() {
    throw new Error("Unsupported operation: entries");
};
types.TransitSet.prototype["entries"] = types.TransitSet.prototype.entries;

types.TransitSet.prototype.forEach = function(iterator, thisArg) {
    var self = this;
    this.map.forEach(function(v, k, m) {
        iterator(k, self);
    });
};
types.TransitSet.prototype["forEach"] = types.TransitSet.prototype.forEach;

types.TransitSet.prototype.has = function(value) {
    return this.map.has(value);
};
types.TransitSet.prototype["has"] = types.TransitSet.prototype.has;

types.TransitSet.prototype.keys = function() {
    throw new Error("Unsupported operation: keys");
};
types.TransitSet.prototype["keys"] = types.TransitSet.prototype.keys;

types.TransitSet.prototype.values = function() {
    throw new Error("Unsupported operation: valuesa");
};
types.TransitSet.prototype["values"] = types.TransitSet.prototype.values;

types.TransitSet.prototype.com$cognitect$transit$equals = function(other) {
    if(other instanceof types.TransitSet) {
        if(this.size === other.size) {
            return eq.equals(this.map, other.map);
        }
    } else {
        return false;
    }
};

types.TransitSet.prototype.com$cognitect$transit$hashCode = function(other) {
    return eq.hashCode(this.map);
};

types.set = function(arr) {
    var map  = {},
        keys = [],
        size = 0;
    for(var i = 0; i < arr.length; i++) {
        var code = eq.hashCode(arr[i]),
            vals = map[code];
        if(vals == null) {
            keys.push(code);
            map[code] = [arr[i], true];
            size++
        } else {
            var newEntry = true;
            for(var j = 0; j < vals.length; j+= 2) {
                if(eq.equals(vals[j], arr[i])) {
                    newEntry = false;
                    break;
                }
            }
            if(newEntry) {
                vals.push(arr[i]);
                vals.push(true);
                size++;
            }
        }
    }
    return new types.TransitSet(new types.TransitMap(keys, map, size));
};

/**
 * @constructor
 */
types.Quote = function(obj) {
    this.obj = obj;
};

types.Quote.prototype.toString = function() {
    return "[Quoted]";
};

types.quoted = function(obj) {
    return new types.Quote(obj);
};

/**
 * @constructor
 */
types.TaggedValue = function(tag, rep) {
    this.tag = tag;
    this.rep = rep;
};

types.TaggedValue.prototype.toString = function() {
    return "[TaggedValue: " + tag + ", " + rep + "]";
};

types.taggedValue = function(tag, rep) {
    return new types.TaggedValue(tag, rep);
};

/**
 * @constructor
 */
types.LinkedList = function(head, tail) {
    this.head = head;
    this.tail = tail;
};

types.LinkedList.prototype.toString = function() {
    return "[LinkedList]";
};

types.cons = function(x, tail) {
    return new types.LinkedList(x, tail);
};

/**
 * @constructor
 */
types.List = function(arr) {
    this.arr = arr;
};

types.list = function(xs) {
    return new types.List(xs);
};

});
