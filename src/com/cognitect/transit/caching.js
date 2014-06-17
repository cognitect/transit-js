// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("com.cognitect.transit.caching");
goog.require("com.cognitect.transit.delimiters");

goog.scope(function() {

var caching = com.cognitect.transit.caching,
    d       = com.cognitect.transit.delimiters;

/**
 * @const
 * @type {number}
 */
caching.MIN_SIZE_CACHEABLE = 3;

/**
 * @const
 * @type {number}
 */
caching.MAX_CACHE_ENTRIES  = 94;

/**
 * @const
 * @type {number}
 */
caching.BASE_CHAR_IDX      = 33;

/**
 * @const
 * @type {number}
 */
caching.MAX_CACHE_SIZE     = 4096;

caching.isCacheable = function(string, asMapKey) {
    if(string.length > caching.MIN_SIZE_CACHEABLE) {
        if(asMapKey) {
            return true;
        } else {
            var c0 = string[0],
                c1 = string[1];
            if(c0 === d.ESC) {
                return c1 === ":" || c1 === "$" || c1 === "#";
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
};

// =============================================================================
// WriteCache

caching.idxToCode = function(idx) {
    return d.SUB + String.fromCharCode(idx + caching.BASE_CHAR_IDX);
};

/**
 * @constructor
 */
caching.WriteCache = function() {
    this.idx = 0;
    this.gen = 0;
    this.cacheSize = 0;
    this.cache = {};
};

caching.WriteCache.prototype.write = function(string, asMapKey) {
    if(caching.isCacheable(string, asMapKey)) {
        if(this.cacheSize === caching.MAX_CACHE_SIZE) {
            this.clear();
            this.gen = 0;
            this.cache = {};
        } else if(this.idx === caching.MAX_CACHE_ENTRIES) {
            this.clear();
        }
        var entry = this.cache[string];
        if(entry == null) {
            this.cache[string] = [caching.idxToCode(this.idx), this.gen];
            this.idx++;
            return string;
        } else if(entry[1] != this.gen) {
            entry[1] = this.gen;
            entry[0] = caching.idxToCode(this.idx);
            this.idx++;
            return string;
        } else {
            return entry[0];
        }
    } else {
        return string;
    }
};

caching.WriteCache.prototype.clear = function() {
    this.idx = 0;
    this.gen++;
};

// =============================================================================
// ReadCache

caching.isCacheCode = function(string) {
    return string[0] === d.SUB;
}

caching.codeToIdx = function(code) {
    return code.charCodeAt(1) - caching.BASE_CHAR_IDX;
}

/**
 * @constructor
 */
caching.ReadCache = function() {
    this.idx = 0;
    this.cache = null;
};

caching.ReadCache.prototype.guaranteeCache = function() {
    if(this.cache) return;
    this.cache = [];
    for(var i = 0; i < caching.MAX_CACHE_ENTRIES; i++) {
        this.cache.push(null);
    }
};
    
caching.ReadCache.prototype.write = function(obj, asMapKey) {
    this.guaranteeCache();
    if(this.idx == caching.MAX_CACHE_ENTRIES) {
        this.idx = 0;
    }
    this.cache[this.idx] = obj;
    this.idx++;
    return obj;
};

caching.ReadCache.prototype.read = function(string, asMapKey) {
    this.guaranteeCache();
    return this.cache[caching.codeToIdx(string)];
};

caching.ReadCache.prototype.clear = function() {
    this.idx = 0;
};

});    
