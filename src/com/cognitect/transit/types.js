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

types.MAX_INT = Long.fromString("9007199254740992");
types.MIN_INT = Long.fromString("-9007199254740992");

types.intValue = function(s) {
    var n = Long.fromString(s, 10);
    if(n.greaterThan(types.MAX_INT) ||
       n.lessThan(types.MIN_INT)) {
        return n;
    } else {
        return n.toNumber();
    }
};

Long.prototype.com$cognitect$transit$equals = function(other) {
    return (other instanceof Long) && this.equals(other);
};

Long.prototype.com$cognitect$transit$hashCode = function() {
    return this.toInt();
};

types.isInteger = function(x) {
    return x instanceof Long;
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

types.isBigDecimal = function(x) {
    return x instanceof types.BigDecimal;
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

types.isKeyword = function(x) {
    return x instanceof types.Keyword;
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

types.isSymbol = function(x) {
    return x instanceof types.Symbol;
};

types.hexFor = function(aLong, sidx, eidx) {
    var ret   = "",
        eidx  = eidx || (sidx+1);

    for(var i=sidx, shift=(7-i)*8, mask=Long.fromInt(0xff).shiftLeft(shift); i < eidx; i++, shift-=8, mask=mask.shiftRightUnsigned(8)) {
        ret += aLong.and(mask).shiftRightUnsigned(shift).toString(16);
    }

    return ret;
};

/**
 * @constructor
 */
types.UUID = function(high, low) {
    this.high = high;
    this.low = low;
    this.hashCode = -1;
};

types.UUID.prototype.getLeastSignificantBits = function() {
    return this.low;
};

types.UUID.prototype.getMostSignificantBits = function() {
    return this.high;
};
    
types.UUID.prototype.toString = function(s) {
    var s    = "",
        hi64 = this.high,
        lo64 = this.low;

    s += types.hexFor(hi64, 0, 4) + "-";
    s += types.hexFor(hi64, 4, 6) + "-";
    s += types.hexFor(hi64, 6, 8) + "-";
    s += types.hexFor(lo64, 0, 2) + "-";
    s += types.hexFor(lo64, 2, 8);

    return s;
};

types.UUID.prototype.com$cognitect$transit$equals = function(other) {
    return (other instanceof types.UUID) && this.high.equals(other.high) && this.low.equals(other.low);
};

types.UUID.prototype.com$cognitecat$transit$hashCode = function() {
    if(this.hashCode !== -1) {
        return this.hashCode;
    } else {
        // TODO: follow http://hg.openjdk.java.net/jdk6/jdk6/jdk/file/2d585507a41b/src/share/classes/java/util/UUID.java
        this.hashCode = eq.hashCode(this.toString());
        return this.hashCode;
    }
};

types.randomUUID = function() {
};

types.UUIDfromString = function uuidFromString(s) {
    var s    = s.replace(/-/g, ""),
        hi64 = null,
        lo64 = null,
        hi32 = 0,
        lo32 = 0,
        off  = 24,
        i    = 0;

    for(hi32=0, i=0, off= 24; i < 8; i+=2, off-=8) {
        hi32 |= (parseInt(s.substring(i,i+2),16) << off);
    }

    for(lo32=0, i=8, off=24; i < 16; i+=2, off-=8) {
        lo32 |= (parseInt(s.substring(i,i+2),16) << off);
    }

    hi64 = Long.fromBits(lo32, hi32);

    for(hi32=0, i=16, off=24; i < 24; i+=2, off-=8) {
        hi32 |= (parseInt(s.substring(i,i+2),16) << off);
    }

    for(lo32=0, i=24, off=24; i < 32; i+=2, off-=8) {
        lo32 |= (parseInt(s.substring(i,i+2),16) << off);
    }

    lo64 = Long.fromBits(lo32, hi32);

    return new types.UUID(hi64, lo64);
};

types.uuid = function(s) {
    return types.UUIDfromString(s);
};

types.isUUID = function(x) {
    return x instanceof types.UUID;
};

types.date = function(s) {
    s = typeof s === "number" ? s : parseInt(s, 10);
    return new Date(s);
};

types.verboseDate = function(s) {
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

types.isBinary = function(x) {
    return x instanceof types.Binary;
}

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
};

types.isURI = function(x) {
    return x instanceof types.URI;
};

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
 * TransitMap
 *   API follows ES6 maps modulo ES5 Iterables/Iteration
 *   http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
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
    this.map = {};
    this.keys = [];
    this.size = 0;
    this.hashCode = -1;
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
    var code = eq.hashCode(k),
        vals = this.map[code];
    if(vals == null) {
        this.keys.push(code);
        this.map[code] = [k, v];
        this.size++;
    } else {
        var newEntry = true;
        for(var i = 0; i < vals.length; i+=2) {
            if(eq.equals(v, vals[i])) {
                newEntry = false;
                vals[i] = v;
                break;
            }
        }
        if(newEntry) {
            vals.push(arr[i]);
            vals.push(arr[i+1]);
            this.size++;
        }
    }
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
    arr = arr || [];

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

types.isMap = function(x) {
    return x instanceof types.TransitMap;
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

types.isSet = function(x) {
    return x instanceof types.TransitSet;
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

types.isQuoted = function(x) {
    return x instanceof types.Quoted;
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

types.isTaggedValue = function(x) {
    return x instanceof types.TaggedValue;
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

types.isList = function(x) {
    return x instanceof types.List;
};

});
