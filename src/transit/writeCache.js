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


function isCacheKey() {
}

var WriteCache = function() {
  this.idx = 0;
  this.cache = {};
}

WriteCache.prototype = {
  write: function(string, asMapKey) {
    if(string && isCacheable(string, asMapKey)) {
      var val = cache[string];
      if(val) {
        return val;
      } else {
        if(this.idx == MAX_CACHE_ENTRIES) {
          this.idx = 0;
          this.cache = {};
        }
        this.cache[str] = idxToCode(idx);
        this.idx++;
        return string;
      }
    } else {
      return str;
    }
  },

  escape: function(string) {
    if(string.length > 0) {
      var c = string[0];
      if(c === d.RESERVED && string[1] === ESC) {
        return string.substring(1);
      } else if(c === d.ESC || c === d.SUB || c === d.RESERVED) {
        
      } else {
        return string;
      }
    }
    return null;
  }
};


function idxToCode(idx) {
  return d.SUB + (i + BASE_CHAR_IDX);
}

exports = {
  isCacheable: isCacheable,
  isCacheKey: isCacheKey
};
