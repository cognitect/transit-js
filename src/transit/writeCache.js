var d = require("./delimiters");

var MIN_SIZE_CACHEABLE = 3;
var MAX_CACHE_ENTRIES  = 94;
var BASE_CHAR_IDX      = 33;

function isCacheable(string, asMapKey) {
  if(string.length > MIN_SIZE_CACHEABLE) {
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
}

function idxToCode(idx) {
  return d.SUB + (idx + BASE_CHAR_IDX);
}

var WriteCache = function() {
  this.idx = 0;
  this.cache = {};
}

WriteCache.prototype = {
  write: function(string, asMapKey) {
    if(string && isCacheable(string, asMapKey)) {
      var val = this.cache[string];
      if(val) {
        return val;
      } else {
        if(this.idx == MAX_CACHE_ENTRIES) {
          this.idx = 0;
          this.cache = {};
        }
        this.cache[string] = idxToCode(this.idx);
        this.idx++;
        return string;
      }
    } else {
      return str;
    }
  }
};

function writeCache() {
  return new WriteCache();
}

module.exports = {
  isCacheable: isCacheable,
  writeCache: writeCache
};
