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

// =============================================================================
// WriteCache

function idxToCode(idx) {
  return d.SUB + String.fromCharCode(idx + BASE_CHAR_IDX);
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
      return string;
    }
  }
};

function writeCache() {
  return new WriteCache();
}

// =============================================================================
// ReadCache

function isCacheCode(string) {
  return string[0] == d.SUB;
}

function codeToIdx(code) {
  return code.charCodeAt(1) - BASE_CHAR_IDX;
}

function parseString(string, decoder) {
  if(typeof string == "string" &&
     (string.length > 1) &&
     (d.ESC == string[0])) {
    var res = null;
    switch(string[1]) {
      case "~": // ESC
      case "^": // SUB
      case "`": // RESERVED
        res = string.substring(1);
        break;
      case "#": // TAG
        res = string;
        break;
      default:
        res = decoder.decode(string[1], string.substring(2));
        break;
    }
    return res;
  } else {
    return string;
  }
}

var ReadCache = function() {
  var cache = [];
  this.idx = 0;
  for(var i = 0; i < MAX_CACHE_ENTRIES; i++) {
    cache.push(null);
  }
  this.cache = cache;
};

ReadCache.prototype = {
  read: function(string, decoder, asMapKey) {
    if(string && (string.length > 1)) {
      if(isCacheable(string, asMapKey)) {
        if(this.idx == MAX_CACHE_ENTRIES) {
          this.idx = 0;
        }
        var obj = parseString(string);
        this.cache[this.idx] = obj;
        return obj;
      } else if(isCacheCode(string)) {
        return this.cache[codeToIdx(string)];
      } else {
        return string;
      }
    } else {
      return string;
    }
  }
};

function readCache() {
  return new ReadCache();
}

module.exports = {
  isCacheable: isCacheable,
  isCacheCode: isCacheCode,
  writeCache: writeCache,
  readCache: readCache,
};
