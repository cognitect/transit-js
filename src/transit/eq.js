"use strict";

var transit$uid$property = "transit_uid_" + Math.floor(Math.random() * 2147483648).toString(36),
    transit$uid = 0;

function equals(x, y) {
  if(x.com$cognitect$transit$equals) {
    return x.com$cognitect$transit$equals(y);
  } else if(Array.isArray(x)) {
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
  } else if(typeof x === "object") {
    if(typeof y === "object") {
      var sub   = 0,
          xklen = 0,
          yklen = Object.keys(y).length;
      for(var p in x) {
        if(!x.hasOwnProperty(p)) continue;
        xklen++;
        if(p == transit$uid$property) {
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
    return x === y;
  }
}

function hashCombine(seed, hash) {
  return seed ^ (hash + 0x9e3779b9 + (seed << 6) + (seed >> 2));
}

function hashCode(x) {
  if(x.com$cognitect$transit$hashCode) {
    return x.com$cognitect$transit$hashCode();
  } else if(x[transit$uid$property]) {
    return x[transit$uid$property];
  } else {
    if(x === null) return 0;
    var t = typeof x;
    switch(t) {
      case 'number':
        return x;
        break;
      case 'boolean':
        return x ? 1 : 0;
        break;
      case 'string':
        // a la goog.string.HashCode
        // http://docs.closure-library.googlecode.com/git/local_closure_goog_string_string.js.source.html#line1206
        var result = 0;
        for (var i = 0; i < x.length; ++i) {
          result = 31 * result + x.charCodeAt(i);
          result %= 0x100000000;
        }
        return result;
        break;
      default:
        var code = 0;
        if(Array.isArray(x)) {
          for(var i = 0; i < x.length; i++) {
            code = hashCombine(code, hashCode(x[i]));
          }
          return code;
        } else {
          var keys = Object.keys(x);
          if(keys.length == 0) {
            code = transit$uid++;
          } else {
            for(var i = 0; i < keys.length; i++) {
              code = hashCombine(code, hashCode(x[keys[i]]));
            }
          }
          x[transit$uid$property]
          return code;
        }
        break;
    }
  }
}

module.exports = {
  equals: equals,
  hashCode: hashCode,
  hashCombine: hashCombine,
  addHashCode: addHashCode
};
