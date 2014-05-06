"use strict";

var transit$guid = 0;

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
      for(var p in x) {
        if(y[p] === undefined) {
          return false;
        } else {
          if(!equals(x[p], y[p])) {
            return false;
          }
        }
      }
      return true;
    } else {
      return false;
    }
  } else {
    return x === y;
  }
}

function addHashCode(x) {
  x.com$cognitect$transit$_hashCode = transit$guid++;
  return x;
}

function hashCode(x) {
  if(x.com$cognitect$transit$_hashCode) {
    return x.com$cognitect$transit$_hashCode;
  } else if(x.com$cognitect$transit$hashCode) {
    return x.com$cognitect$transit$hashCode();
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
        addHashCode(x);
        return x.com$cognitect$transit$_hashCode;
        break;
    }
  }
}

module.exports = {
  equals: equals,
  hashCode: hashCode,
  addHashCode: addHashCode
};
