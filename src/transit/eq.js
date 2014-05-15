// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var transitHashCodeProperty = "com$cognitect$transit$hashCode$" + Math.floor(Math.random() * 2147483648).toString(36);

function equals(x, y) {
    if(x == null) {
        return y == null;
    } else if(x === y) {
        return true;
    } else if(typeof x === "object") {
        if(Array.isArray(x)) {
            if(Array.isArray(y)) {
                if(x.length === y.length) {
                    for(var i = 0; i < x.length; i++) {
                        if(!equals(x[i], y[i])) {
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
        } else if(x.com$cognitect$transit$equals) {
            return x.com$cognitect$transit$equals(y);      
        } else if(typeof y === "object") {
            var sub   = 0,
                xklen = 0,
                yklen = Object.keys(y).length;
            for(var p in x) {
                if(!x.hasOwnProperty(p)) continue;
                xklen++;
                if(p == transitHashCodeProperty) {
                    if(!y[p]) sub = -1;
                    continue;
                }
                if(!y.hasOwnProperty(p)) {
                    return false;
                } else {
                    if(!equals(x[p], y[p])) {
                        return false;
                    }
                }
            }
            return (xklen + sub) === yklen;
        } else {
            return false;
        }
    } else {
        return false
    }
}

function hashCombine(seed, hash) {
    return seed ^ (hash + 0x9e3779b9 + (seed << 6) + (seed >> 2));
}

var stringCodeCache     = {},
    stringCodeCacheSize = 0,
    STR_CACHE_MAX       = 256;

function hashString(str) {
    // a la goog.string.HashCode
    // http://docs.closure-library.googlecode.com/git/local_closure_goog_string_string.js.source.html#line1206
    var cached = stringCodeCache[str];
    if(cached != null) {
        return cached;
    }
    var code = 0;
    for (var i = 0; i < str.length; ++i) {
        code = 31 * code + str.charCodeAt(i);
        code %= 0x100000000;
    }
    stringCodeCacheSize++;
    if(stringCodeCacheSize >= STR_CACHE_MAX) {
        stringCodeCache = {};
        stringCodeCacheSize = 1;
    }
    stringCodeCache[str] = code;
    return code;
}

function hashMapLike(m) {
    var code = 0;
    // ES6 Map-like case
    if(m.forEach != null) {
        m.forEach(function(val, key, m) {
            code = (code + (hashCode(key) ^ hashCode(val))) % 4503599627370496;
        });
    } else {
        // JS Object case
        var keys = Object.keys(m);
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if(key === transitHashCodeProperty) continue;
            var val = m[key];
            code = (code + (hashCode(key) ^ hashCode(val))) % 4503599627370496;
        }
    }
    return code;
}

function hashArrayLike(arr) {
    var code = 0;
    for(var i = 0; i < arr.length; i++) {
        code = hashCombine(code, hashCode(arr[i]));
    }
    return code;
}

function hashCode(x) {
    if(x === null) {
        return 0;
    } else {
        var t = typeof x;
        switch(t) {
        case 'number':
            return x;
            break;
        case 'boolean':
            return x === true ? 1 : 0;
            break;
        case 'string':
            return hashString(x);
            break;
        default:
            if(x instanceof Date) {
                return x.valueOf();
            } else if(Array.isArray(x)) {
                return hashArrayLike(x);
            } if(x.com$cognitect$transit$hashCode) {
                return x.com$cognitect$transit$hashCode();
            } else if(x[transitHashCodeProperty]) {
                return x[transitHashCodeProperty];
            } else {
                var code = hashMapLike(x);
                x[transitHashCodeProperty] = code;
                return code;
            }
            break;
        }
    }
}

function extendToEQ(obj, opts) {
    obj.com$cognitect$transit$hashCode = opts.hashCode;
    obj.com$cognitect$transit$equals = opts.equals;
    return obj;
}

module.exports = {
    equals: equals,
    hashCode: hashCode,
    hashCombine: hashCombine,
    hashString: hashString,
    hashArrayLike: hashArrayLike,
    hashMapLike: hashMapLike,
    transitHashCodeProperty: transitHashCodeProperty,
    extendToEQ: extendToEQ
};
