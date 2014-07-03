// Copyright (c) Cognitect, Inc.
// All rights reserved.

goog.provide("com.cognitect.transit.types");
goog.require("com.cognitect.transit.util");
goog.require("com.cognitect.transit.eq");
goog.require("goog.math.Long");

goog.scope(function() {

var types = com.cognitect.transit.types,
    util  = com.cognitect.transit.util,
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
types.BigInteger = function(s) {
    this.value = s;
};

types.BigInteger.prototype.toString = function() {
    return "[BigInteger: "+this.value+"]";
};

types.BigInteger.prototype.com$cognitect$transit$equals = function(other) {
    return (other instanceof types.BigInteger) && (this.value === other.value);
};
    
types.BigInteger.prototype.com$cognitect$transit$hashCode = function() {
    return eq.hashCode(this.value);
};

types.bigInteger = function(s) {
    return new types.BigInteger(s);
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
    return ":"+this.name;
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
        var s = aLong.and(mask).shiftRightUnsigned(shift).toString(16);
        if(s.length == 1) {
            s = "0" + s;
        }
        ret += s;
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
 * @const
 * @type {number}
 */
types.KEYS = 0;

/**
 * @const
 * @type {number}
 */
types.VALUES = 1;

/**
 * @const
 * @type {number}
 */
types.ENTRIES = 2;

/**
 * @constructor
 */
types.TransitMapIterator = function(map, type) {
    this.map = map;
    this.type = type || types.KEYS;
    this.keys = this.map.getKeys();
    this.idx = 0;
    this.bucket = null;
    this.bucketIdx = 0;
};

types.TransitMapIterator.prototype.next = function() {
    if(this.idx < this.map.size) {
        if((this.bucket == null) || !(this.bucketIdx < this.bucket.length)) {
            this.bucket = this.map.map[this.keys[this.idx]];
            this.bucketIdx = 0;
        }

        var value = null;
        if(this.type === types.KEYS) {
            value = this.bucket[this.bucketIdx];
        } else if(this.type === types.VALUES) {
            value = this.bucket[this.bucketIdx+1];
        } else {
            value = [this.bucket[this.bucketIdx], this.bucket[this.bucketIdx+1]];
        }

        var ret = {
            "value": value,
            "done": false
        };

        this.idx++;
        this.bucketIdx+=2;

        return ret;
    } else {
        return {"done": true};
    }
};
types.TransitMapIterator.prototype["next"] = types.TransitMapIterator.prototype.next;

/**
 * TransitArrayMap
 */
types.TransitArrayMap = function(entries) {
    this.entries = entries;
};

types.TransitArrayMap.prototype.toString = function() {
    return "[TransitArrayMap]";
};

types.TransitArrayMap.prototype.clear = function() {
    this.entries = [];
};

types.TransitArrayMap.prototype.keys = function() {
};

types.TransitArrayMap.prototype.keySet = function() {
    var ret = [];
    for(var i = 0, j = 0; j < this.entries.length; i++, j+=2) {
        ret[i] = entries[j];
    }
    return ret;
};

types.TransitArrayMap.prototype.entries = function() {
};

types.TransitArrayMap.prototype.values = function() {
};

types.TransitArrayMap.prototype.forEach = function() {
};

types.TransitArrayMap.prototype.get = function(k) {
};

types.TransitArrayMap.prototype.has = function(k) {
};

types.TransitArrayMap.prototype.set = function(k) {
};

types.TransitMap.prototype.com$cognitect$transit$hashCode = function() {
};

types.TransitMap.prototype.com$cognitect$transit$equals = function(other) {
};

/**
 * TransitMap
 *   API follows ES6 maps modulo ES5 Iterables/Iteration
 *   http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 * @constructor
 */
types.TransitMap = function(keys, map, size) {
    this.map = map || {};
    this._keys = keys || [];
    this.size = size || 0;
    this.hashCode = -1;
};

types.TransitMap.prototype.toString = function() {
    return "[TransitMap]";
};

types.TransitMap.prototype.clear = function() {
    this.map = {};
    this._keys = [];
    this.size = 0;
    this.hashCode = -1;
};
types.TransitMap.prototype["clear"] = types.TransitMap.prototype.clear;

types.TransitMap.prototype.getKeys = function() {
    if(this._keys != null) {
        return this._keys;
    } else {
        return util.objectKeys(this.map);
    }
};

types.TransitMap.prototype['delete'] = function(k) {
    this._keys = null;
    var code   = eq.hashCode(k),
        bucket = this.map[code];

    for(var i = 0; i < bucket.length; i+=2) {
        if(eq.equals(k, bucket[i])) {
            bucket.splice(i,2);
            if(bucket.length === 0) {
                delete this.map[code];
            }
            this.size--;
            break;
        }
    }
};

types.TransitMap.prototype.entries = function() {
    return new types.TransitMapIterator(this, types.ENTRIES);
};
types.TransitMap.prototype["entries"] = types.TransitMap.prototype.entries;

types.TransitMap.prototype.forEach = function(callback) {
    var ks = this.getKeys();
    for(var i = 0; i < ks.length; i++) {
        var bucket = this.map[ks[i]];
        for(var j = 0; j < bucket.length; j+=2) {
            callback(bucket[j+1], bucket[j], this);
        }
    }
};
types.TransitMap.prototype["forEach"] = types.TransitMap.prototype.forEach;

types.TransitMap.prototype.get = function(k) {
  var code   = eq.hashCode(k),
      bucket = this.map[code];
    if(bucket != null) {
        for(var i = 0; i < bucket.length; i+=2) {
            if(eq.equals(k,bucket[i])) {
                return bucket[i+1];
            }
        }
    } else {
        return null;
    } 
};
types.TransitMap.prototype["get"] = types.TransitMap.prototype.get;

types.TransitMap.prototype.has = function(k) {
    var code   = eq.hashCode(k),
        bucket = this.map[code];
    if(bucket != null) {
        for(var i = 0; i < bucket.length; i+=2) {
            if(eq.equals(k, bucket[i])) {
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
    return new types.TransitMapIterator(this, types.KEYS);
};
types.TransitMap.prototype["keys"] = types.TransitMap.prototype.keys;

types.TransitMap.prototype.keySet = function() {
    var keys = this.getKeys(),
        ret  = [];

    for(var i = 0; i < keys.length; i++) {
        var bucket = this.map[keys[i]];
        for(var j = 0; j < bucket.length; j+=2) {
            ret.push(bucket[j]);
        }
    }

    return ret;
};
types.TransitMap.prototype["keySet"] = types.TransitMap.prototype.keySet;
  
types.TransitMap.prototype.set = function(k, v) {
    var code = eq.hashCode(k),
        bucket = this.map[code];
    if(bucket == null) {
        if(this._keys) {
            this._keys.push(code);
        }
        this.map[code] = [k, v];
        this.size++;
    } else {
        var newEntry = true;
        for(var i = 0; i < bucket.length; i+=2) {
            if(eq.equals(v, bucket[i])) {
                newEntry = false;
                bucket[i] = v;
                break;
            }
        }
        if(newEntry) {
            bucket.push(arr[i]);
            bucket.push(arr[i+1]);
            this.size++;
        }
    }
};
types.TransitMap.prototype["set"] = types.TransitMap.prototype.set;

types.TransitMap.prototype.values = function() {
    return new types.TransitMapIterator(this, types.VALUES);
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
            var bucket = this.map[code];
            for(var j = 0; j < bucket.length; j+=2) {
                if(!eq.equals(bucket[j+1], other.get(bucket[j]))) {
                    return false;
                }
            }
        }
        return true;
    } else if(other != null && (typeof other === "object")) {
        var ks    = Object.keys(other),
            kslen = ks.length - ((other.hasOwnProperty(eq.transitHashCodeProperty) && 1) || 0); 
        if(this.size === kslen) {
            for(var p in other) {
                if((p !== eq.transitHashCodeProperty) &&
                   (!eq.equals(other[p], this.get(p)))) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

types.map = function(arr) {
    arr = arr || [];

    if(arr.length <= 8) {
        return new types.TransitArrayMap(arr);
    } else {
        var map  = {},
            keys = [],
            size = 0;
        for(var i = 0; i < arr.length; i+=2) {
            var code = eq.hashCode(arr[i]),
                bucket = map[code];
            if(bucket == null) {
                keys.push(code);
                map[code] = [arr[i], arr[i+1]];
                size++;
            } else {
                var newEntry = true;
                for(var j = 0; j < bucket.length; j+= 2) {
                    if(eq.equals(bucket[j], arr[i])) {
                        bucket[j+1] = arr[i+1];
                        newEntry = false;
                        break;
                    }
                }
                if(newEntry) {
                    bucket.push(arr[i]);
                    bucket.push(arr[i+1]);
                    size++;
                }
            }
        }
        return new types.TransitMap(keys, map, size);
    }
};

types.isMap = function(x) {
    return x instanceof types.TransitMap;
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
    this.map = new types.TransitMap();
    this.size = 0;
};
types.TransitSet.prototype["clear"] = types.TransitSet.prototype.clear;

types.TransitSet.prototype['delete'] = function(value) {
    this.map["delete"](value);
    this.size = this.map.size;
};

types.TransitSet.prototype.entries = function() {
    return this.map.entries();
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
    return this.map.keys();
};
types.TransitSet.prototype["keys"] = types.TransitSet.prototype.keys;

types.TransitSet.prototype.keySet = function() {
    return this.map.keySet();
};
types.TransitSet.prototype["keySet"] = types.TransitSet.prototype.keySet;

types.TransitSet.prototype.values = function() {
    return this.map.values();
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
            map[code] = [arr[i], arr[i]];
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
                vals.push(arr[i]);
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

/**
 * @constructor
 */
types.Link = function(rep) {
    this.rep = rep;
};

types.link = function(rep) {
    return new types.Link(rep);
};

types.isLink = function(x) {
    return x instanceof types.Link;
};

});

