// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("transit.caching");
goog.require("transit.delimiters");

transit.caching.MIN_SIZE_CACHEABLE = 3;
transit.caching.MAX_CACHE_ENTRIES  = 94;
transit.caching.BASE_CHAR_IDX      = 33;

transit.caching.isCacheable = function(string, asMapKey) {
    if(string.length > transit.caching.MIN_SIZE_CACHEABLE) {
        if(asMapKey) {
            return true;
        } else {
            var c0 = string[0],
                c1 = string[1];
            if(c0 === transit.delimiters.ESC) {
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

transit.caching.idxToCode = function(idx) {
    return transit.delimiters.SUB + String.fromCharCode(idx + transit.caching.BASE_CHAR_IDX);
};

transit.caching.WriteCache = function() {
    this.idx = 0;
    this.cache = {};
};

transit.caching.WriteCache.prototype.write = function(string, asMapKey) {
    if(string != null && transit.caching.isCacheable(string, asMapKey)) {
        var val = this.cache[string];
        if(val != null) {
            return val;
        } else {
            if(this.idx === transit.caching.MAX_CACHE_ENTRIES) {
                this.idx = 0;
                this.cache = {};
            }
            this.cache[string] = transit.caching.idxToCode(this.idx);
            this.idx++;
            return string;
        }
    } else {
        return string;
    }
};

transit.caching.WriteCache.prototype.clear = function() {
    this.cache = {};
    this.idx = 0;
};

// =============================================================================
// ReadCache

transit.caching.isCacheCode = function(string) {
    return string[0] === transit.delimiters.SUB;
}

transit.caching.codeToIdx = function(code) {
    return code.charCodeAt(1) - tranist.caching.BASE_CHAR_IDX;
}

transit.caching.ReadCache = function() {
    this.idx = 0;
    this.cache = null;
};

transit.caching.ReadCache.prototype.guaranteeCache = function() {
    if(this.cache) return;
    this.cache = [];
    for(var i = 0; i < transit.caching.MAX_CACHE_ENTRIES; i++) {
        this.cache.push(null);
    }
};
    
transit.caching.ReadCache.prototype.write = function(string, obj, asMapKey) {
    this.guaranteeCache();
    if(this.idx == transit.caching.MAX_CACHE_ENTRIES) {
        this.idx = 0;
    }
    this.cache[this.idx] = [obj, string];
    this.idx++;
    return obj;
};

transit.caching.ReadCache.prototype.read = function(string, asMapKey) {
    this.guaranteeCache();
    var ret = this.cache[codeToIdx(string)];
    if(asMapKey) {
        if(ret[0] === ret[1]) {
            return ret[1];
        } else {
            return transit.delimiters.RES+ret[1];
        }
    } else {
        return ret[0];
    }
};

transit.caching.ReadCache.prototype.clear = function() {
    this.idx = 0;
};
