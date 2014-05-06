"use strict";

function equals(x, y) {
  if(x.com$cognitect$transit$equals) {
    return x.com$cognitect$transit$equals(y);
  } else if(Array.isArray(x)) {
    if(Array.isArray(y)) {
      if(x.length === y.length) {
        for(var i = 0; i < x.length; x++) {
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
