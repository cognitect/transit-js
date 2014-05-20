// Copyright (c) Cognitect, Inc.
// All rights reserved.
  
"use strict";

goog.provide("transit.types");
goog.require("transit.eq");

transit.types.nullValue = function() {
    return null;
};

transit.types.boolValue = function(s) {
    return s === "t";
};

/**
 * @constructor
 */
transit.types.Integer = function(str) {
    this.str = str;
};

transit.types.intValue = function(s) {
    return new transit.types.Integer(s);
};

transit.types.floatValue = function(s) {
    return parseFloat(s);
};

/**
 * @constructor
 */
transit.types.BigDecimal = function(s) {
    this.value = s;
};

transit.types.bigDecimalValue = function(s) {
    return new transit.types.BigDecimal(s);
};

transit.types.charValue = function(s) {
    return s;
};

/**
 * @constructor
 */
transit.types.Keyword = function(name) {
    this.name = name;
    this.hashCode = -1;
};

transit.types.Keyword.prototype.com$cognitect$transit$equals = function(other) {
    return (other instanceof transit.types.Keyword) && this.name == other.name;
};

transit.types.Keyword.prototype.com$cognitect$transit$hashCode = function() {
    if(this.hashCode !== -1) {
        return this.hashCode;
    } else {
        this.hashCode = transit.eq.hashCode(this.name);
        return this.hashCode;
    }
};

transit.types.keyword = function(s) {
    return new transit.types.Keyword(s);
};

/**
 * @constructor
 */
transit.types.Symbol = function(name) {
    this.name = name;
    this.hashCode = -1;
};

transit.types.Symbol.prototype.com$cognitect$transit$equals = function(other) {
    return (other instanceof transit.types.Symbol) && this.name == other.name;
};

transit.types.Symbol.prototype.com$cognitect$transit$hashCode = function() {
    if(this.hashCode !== -1) {
        return this.hashCode;
    } else {
        this.hashCode = transit.eq.hashCode(this.name);
        return this.hashCode;
    }
};

transit.types.symbol = function(s) {
    return new transit.types.Symbol(s);
};

/**
 * @constructor
 */
transit.types.UUID = function(str) {
    this.str = str;
    this.hashCode = -1;
};

transit.types.UUID.prototype.com$cognitect$transit$equals = function(other) {
    return (other instanceof UUID) && this.str == other.str;
};

transit.types.UUID.prototype.com$cognitecat$transit$hashCode = function() {
    if(this.hashCode !== -1) {
        return this.hashCode;
    } else {
        this.hashCode = transit.eq.hashCode(this.str);
        return this.hashCode;
    }
};

transit.types.uuid = function(s) {
    return new transit.types.UUID(s);
};

transit.types.date = function(s) {
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
transit.types.Binary = function(str) {
    this.str = str;
};

transit.types.binary = function(str) {
    return new transit.types.Binary(str);
};

/**
 * @constructor
 */
transit.types.URI = function(uri) {
    this.uri = uri;
};

transit.types.uri = function(s) {
    return new transit.types.URI(s);
}

transit.types.ints = function(xs) {
    return xs;
};

transit.types.longs = function(xs) {
    return xs;
};

transit.types.floats = function(xs) {
    return xs;
};

transit.types.doubles = function(xs) {
    return xs;
};

transit.types.bools = function(xs) {
    return xs;
};

/**
 * @constructor
 */
transit.types.TransitMap = function(keys, map, size) {
    this.map = map;
    this.keys = keys;
    this.size = size;
    this.hashCode = -1;
};

transit.types.TransitMap.prototype.clear = function() {
    throw new Error("Unsupported operation: clear");
};

transit.types.TransitMap.prototype['delete'] = function() {
    throw new Error("Unsupported operation: delete");
};

transit.types.TransitMap.prototype.entries = function() {
    throw new Error("Unsupported operation: entries");
};

transit.types.TransitMap.prototype.forEach = function(callback) {
    for(var i = 0; i < this.keys.length; i++) {
        var vals = this.map[this.keys[i]];
        for(var j = 0; j < vals.length; j+=2) {
            callback(vals[j+1], vals[j], this);
        }
    }
};

transit.types.TransitMap.prototype.get = function(k) {
  var code = transit.eq.hashCode(k),
      vals = this.map[code];
    if(vals != null) {
        for(var i = 0; i < vals.length; i+=2) {
            if(transit.eq.equals(k,vals[i])) {
                return vals[i+1];
            }
        }
    } else {
        return null;
    } 
};

transit.types.TransitMap.prototype.has = function(k) {
    var code = transit.eq.hashCode(k),
        vals = this.map[code];
    if(vals != null) {
        for(var i = 0; i < vals.length; i+=2) {
            if(transit.eq.equals(k,vals[i])) {
                return true;
            }
        }
        return false;
    } else {
        return false;
    }
};

transit.types.TransitMap.prototype.keys = function() {
    throw new Error("Unsupported operation: keys");
};
  
transit.types.TransitMap.prototype.set = function(k, v) {
    throw new Error("Unsupported operation: set");
};

transit.types.TransitMap.prototype.values = function() {
    throw new Error("Unsupported operation: value");
};
  
transit.types.TransitMap.prototype.com$cognitect$transit$hashCode = function() {
    if(this.hashCode != -1) return this.hashCode;
    this.hashCode = transit.eq.hashMapLike(this);
    return this.hashCode;
};

transit.types.TransitMap.prototype.com$cognitect$transit$equals = function(other) {
    if((other instanceof TransitMap) &&
       (this.size === other.size)) {
        for(var code in this.map) {
            var vals = this.map[code];
            for(var j = 0; j < vals.length; j+=2) {
                if(!transit.eq.equals(vals[j+1], other.get(vals[j]))) {
                    return false;
                }
            }
        }
        return true;
    } else {
        return false;
    }
};

transit.types.map = function(arr) {
    var map  = {},
        keys = [],
        size = 0;
    for(var i = 0; i < arr.length; i+=2) {
        var code = transit.eq.hashCode(arr[i]),
            vals = map[code];
        if(vals == null) {
            keys.push(code);
            map[code] = [arr[i], arr[i+1]];
            size++;
        } else {
            var newEntry = true;
            for(var j = 0; j < vals.length; j+= 2) {
                if(transit.eq.equals(vals[j], arr[i])) {
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
    return new transit.types.TransitMap(keys, map, size);
};

transit.types.cmap = function(xs) {
    return transit.types.map(xs);
};

/**
 * @constructor
 */
transit.types.TransitSet = function(map) {
    this.map = map;
    this.size = map.size;
};

transit.types.TransitSet.prototype.add = function(value) {
    throw new Error("Unsupported operation: add");
};

transit.types.TransitSet.prototype.clear = function() {
    throw new Error("Unsupported operation: clear");
};

transit.types.TransitSet.prototype['delete'] = function(value) {
    throw new Error("Unsupported operation: delete");
};

transit.types.TransitSet.prototype.entries = function() {
    throw new Error("Unsupported operation: entries");
};

transit.types.TransitSet.prototype.forEach = function(iterator, thisArg) {
    var self = this;
    this.map.forEach(function(v, k, m) {
        iterator(k, self);
    });
};

transit.types.TransitSet.prototype.has = function(value) {
    return this.map.has(value);
};

transit.types.TransitSet.prototype.keys = function() {
    throw new Error("Unsupported operation: keys");
};

transit.types.TransitSet.prototype.values = function() {
    throw new Error("Unsupported operation: valuesa");
};

transit.types.TransitSet.prototype.com$cognitect$transit$equals = function(other) {
    if(other instanceof TransitSet) {
        if(this.size === other.size) {
            return transit.eq.equals(this.map, other.map);
        }
    } else {
        return false;
    }
};

transit.types.TransitSet.prototype.com$cognitect$transit$hashCode = function(other) {
    return transit.eq.hashCode(this.map);
};

transit.types.set = function(arr) {
    var map  = {},
        keys = [],
        size = 0;
    for(var i = 0; i < arr.length; i++) {
        var code = transit.eq.hashCode(arr[i]),
            vals = map[code];
        if(vals == null) {
            keys.push(code);
            map[code] = [arr[i], true];
            size++
        } else {
            var newEntry = true;
            for(var j = 0; j < vals.length; j+= 2) {
                if(transit.eq.equals(vals[j], arr[i])) {
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
    return new transit.types.TransitSet(new transit.types.TransitMap(keys, map, size));
};

/**
 * @constructor
 */
transit.types.Quote = function(obj) {
    this.obj = obj;
};

transit.types.quoted = function(obj) {
    return new transit.types.Quote(obj);
};

/**
 * @constructor
 */
transit.types.TaggedValue = function(tag, rep) {
    this.tag = tag;
    this.rep = rep;
};

transit.types.taggedValue = function(tag, rep) {
    return new transit.types.TaggedValue(tag, rep);
};

/**
 * @constructor
 */
transit.types.LinkedList = function(head, tail) {
    this.head = head;
    this.tail = tail;
};

transit.types.cons = function(x, tail) {
    return new transit.types.LinkedList(x, tail);
};

/**
 * @constructor
 */
transit.types.List = function(arr) {
    this.arr = arr;
};

transit.types.list = function(xs) {
    return new transit.types.List(xs);
};
