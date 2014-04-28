var MIN_SIZE_CACHEABLE = 3;
var MAX_CACHE_ENTRIES = 94;
var BASE_CHAR_IDX = 33;
var ESC = "~";
var TAG = "#";
var CACHE = "^";
var RESERVED = "`";
var ESC_TAG = "~#";

var WriteCache = function() {}

WriteCache.prototype = {
  cacheWrite: function(string, asMapKey) {
  },

  escape: function(string) {
    if(string.length > 0) {
      var c = string[0];
      if(c === RESERVED && string[1] === ESC) {
        return string.substring(1);
      } else if() {
      }
    }
    return null;
  }
};

function isCacheable(string, asMapKey) {
  if(string.length > MIN_SIZE_CACHEABLE) {
    if(asMapKey) {
      return true;
    } else {
      var c0 = string[0],
          c1 = string[1];
      if(c0 === ESC) {
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

function idxToCode(idx) {
  return CACHE + (i + BASE_CHAR_IDX);
}

exports = {
  isCacheable: isCacheable,
  isCacheKey: isCacheKey
};
