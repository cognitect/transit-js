// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("com.cognitect.transit.handlers");
goog.require("com.cognitect.transit.types");

goog.scope(function() {

var handlers = com.cognitect.transit.handlers,
    types    = com.cognitect.transit.types;

handlers.ctorGuid         = 0;

/**
 * @const
 * @type {string}
 */
handlers.ctorGuidProperty = "com$cognitect$transit$ctor$guid";

handlers.typeTag = function(ctor) {
    if(ctor == null) {
        return "null";
    } else if(ctor === String) {
        return "string";
    } else if(ctor === Boolean) {
        return "boolean";
    } else if(ctor === Number) {
        return "number";
    } else if(ctor === Array) {
        return "array";
    } else if(ctor === Object) {
        return "map";
    } else {
        var tag = ctor[handlers.ctorGuidProperty];
        if(tag == null) {
            ctor[handlers.ctorGuidProperty] = tag = ++handlers.ctorGuid;
        }
        return tag;
    }
};

handlers.constructor = function(x) {
    if(x == null) {
        return null;
    } else {
        return x.constructor;
    }
};

handlers.padZeros = function(n,m) {
    var s = n.toString();
    for(var i = s.length; i < m; i++) {
        s = "0"+s;
    }
    return s;
};

handlers.stringableKeys = function(m) {
    var stringable = false,
    ks = Object.keys(m);

    for(var i = 0; i < ks.length; i++) {
    }

    return true;
};

/**
 * @constructor
 */
var NilHandler = function(){};
NilHandler.prototype.tag = function(v) { return "_"; };
NilHandler.prototype.rep = function(v) { return null; };
NilHandler.prototype.stringRep = function(v) { return "null"; };

/**
 * @constructor
 */
var StringHandler = function(){};
StringHandler.prototype.tag = function(v) { return "s"; };
StringHandler.prototype.rep = function(v) { return v; };
StringHandler.prototype.stringRep = function(v) { return v; };

/**
 * @constructor
 */
var NumberHandler = function(){};
NumberHandler.prototype.tag = function(v) { return "i"; };
NumberHandler.prototype.rep = function(v) { return v; };
NumberHandler.prototype.stringRep = function(v) { return v.toString(); };

/**
 * @constructor
 */
var IntegerHandler = function(){};
IntegerHandler.prototype.tag = function(v) { return "i"; };
IntegerHandler.prototype.rep = function(v) { return v.str; };
IntegerHandler.prototype.stringRep = function(v) { return v.str; };

/**
 * @constructor
 */
var BigDecimalHandler = function(){};
BigDecimalHandler.prototype.tag = function(v) { return "f"; };
BigDecimalHandler.prototype.rep = function(v) { return v.value; };
BigDecimalHandler.prototype.stringRep = function(v) { return v.value; };

/**
 * @constructor
 */
var BooleanHandler = function(){};
BooleanHandler.prototype.tag = function(v) { return "?"; };
BooleanHandler.prototype.rep = function(v) { return v; };
BooleanHandler.prototype.stringRep = function(v) { return v.toString(); };

/**
 * @constructor
 */
var ArrayHandler = function(){};
ArrayHandler.prototype.tag = function(v) { return "array"; };
ArrayHandler.prototype.rep = function(v) { return v; };
ArrayHandler.prototype.stringRep = function(v) { return null; };

/**
 * @constructor
 */
var MapHandler = function(){};
MapHandler.prototype.tag = function(v) { return "map"; };
MapHandler.prototype.rep = function(v) { return v; };
MapHandler.prototype.stringRep = function(v) { return null; };

/**
 * @constructor
 */
var DateHandler = function(){};
DateHandler.prototype.tag = function(v) { return "t"; };
DateHandler.prototype.rep = function(v) { return v.valueOf(); };
DateHandler.prototype.stringRep = function(v) { return v.valueOf().toString(); };
DateHandler.prototype.humanStringRep = function(v) {
    return v.getUTCFullYear()+"-"+handlers.padZeros(v.getUTCMonth()+1,2)+"-"+
           handlers.padZeros(v.getUTCDate(),2)+"T"+handlers.padZeros(v.getUTCHours(),2)+":"+
           handlers.padZeros(v.getUTCMinutes(),2)+":"+handlers.padZeros(v.getUTCSeconds(),2)+"."+
           handlers.padZeros(v.getUTCMilliseconds(),3)+"Z";
};

/**
 * @constructor
 */
var BinaryHandler = function(){};
BinaryHandler.prototype.tag = function(v) { return "b"; };
BinaryHandler.prototype.rep = function(v) { return v.str; };
BinaryHandler.prototype.stringRep = function(v) { return v.str; };

/**
 * @constructor
 */
var UUIDHandler = function(){};
UUIDHandler.prototype.tag = function(v) { return "u"; };
UUIDHandler.prototype.rep = function(v) { return v.str; };
UUIDHandler.prototype.stringRep = function(v) { return v.str; };

/**
 * @constructor
 */
var URIHandler = function(){};
URIHandler.prototype.tag = function(v) { return "r"; };
URIHandler.prototype.rep = function(v) { return v.uri; };
URIHandler.prototype.stringRep = function(v) { return v.uri; };

/**
 * @constructor
 */
var KeywordHandler = function(){};
KeywordHandler.prototype.tag = function(v) { return ":"; };
KeywordHandler.prototype.rep = function(v) { return v.name; }; // NOTE: should be fqn
KeywordHandler.prototype.stringRep = function(v, h) { return h.rep(v); };

/**
 * @constructor
 */
var SymbolHandler = function(){};
SymbolHandler.prototype.tag = function(v) { return "$"; };
SymbolHandler.prototype.rep = function(v) { return v.name; }; // NOTE: should be str
SymbolHandler.prototype.stringRep = function(v, h) { return h.rep(v); };

/**
 * @constructor
 */
var QuoteHandler = function(){};
QuoteHandler.prototype.tag = function(v) { return "'"; };
QuoteHandler.prototype.rep = function(v) { return v.obj; };
QuoteHandler.prototype.stringRep = function(v, h) { return null; };

/**
 * @constructor
 */
var TaggedHandler = function(){};
TaggedHandler.prototype.tag = function(v) { return v.tag; };
TaggedHandler.prototype.rep = function(v) { return v.rep; };
TaggedHandler.prototype.stringRep = function(v, h) { return null; };

/**
 * @constructor
 */
var TransitSetHandler = function(){};
TransitSetHandler.prototype.tag = function(v) { return "set"; };
TransitSetHandler.prototype.rep = function(v) {
    var arr = [];
    v.forEach(function(key, set) {
        arr.push(key);
    });
    return types.taggedValue("array", arr);
};
TransitSetHandler.prototype.stringRep = function(v, h) { return null; };

/**
 * @constructor
 */
var TransitMapHandler = function(){};
TransitMapHandler.prototype.tag = function(v) { return "cmap"; };
TransitMapHandler.prototype.rep = function(v) {
    var arr = [];
    v.forEach(function(val, key, map) {
        arr.push(key);
        arr.push(val);
    });
    return types.taggedValue("array", arr);
};
TransitMapHandler.prototype.stringRep = function(v, h) { return null; };

/**
 * @constructor
 */
var ListHandler = function(){};
ListHandler.prototype.tag = function(v) { return "list"; };
ListHandler.prototype.rep = function(v) { return types.taggedValue("array", v.arr); };
ListHandler.prototype.stringRep = function(b) { return null; };
    
handlers.defaultHandlers = function(hs) {
    hs.set(null, new NilHandler());
    hs.set(String, new StringHandler());
    hs.set(Number, new NumberHandler());
    hs.set(types.Integer, new IntegerHandler());
    hs.set(types.BigDecimal, new BigDecimalHandler());
    hs.set(Boolean, new BooleanHandler());
    hs.set(Array, new ArrayHandler());
    hs.set(Object, new MapHandler());
    hs.set(Date, new DateHandler());
    hs.set(types.Binary, new BinaryHandler());
    hs.set(types.UUID, new UUIDHandler());
    hs.set(types.URI, new URIHandler());
    hs.set(types.Keyword, new KeywordHandler());
    hs.set(types.Symbol, new SymbolHandler());
    hs.set(types.Quote, new QuoteHandler());
    hs.set(types.TaggedValue, new TaggedHandler());
    hs.set(types.TransitSet, new TransitSetHandler());
    hs.set(types.TransitMap, new TransitMapHandler());
    hs.set(types.List, new ListHandler());
    return hs;
};

/**
 * @constructor
 */
handlers.Handlers = function() {
    this.handlers = {};
    handlers.defaultHandlers(this);
};

handlers.Handlers.prototype.get = function(ctor) {
    return this.handlers[handlers.typeTag(ctor)];
};

handlers.Handlers.prototype.set = function(ctor, handler) {
    this.handlers[handlers.typeTag(ctor)] = handler;
};

});    
