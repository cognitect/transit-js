// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("com.cognitect.transit.handlers");
goog.require("com.cognitect.transit.types");

goog.scope(function() {

var handlers = com.cognitect.transit.handlers,
    types    = com.cognitect.transit.types;

handlers.ctorGuid         = 0,
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

handlers.defaultHandlers = function(hs) {
    hs.set(
        null,
        {tag: function(v) { return "_"; },
         rep: function(v) { return null; },
         stringRep: function(v) { return "null"; }});

    hs.set(
        String,
        {tag: function(v) { return "s"; },
         rep: function(v) { return v; },
         stringRep: function(v) { return v.toString(); }});

    hs.set(
        Number,
        {tag: function(v) { return "i" },
         rep: function(v) { return v; },
         stringRep: function(v) { return v.toString(); }});

    hs.set(
        types.Integer,
        {tag: function(v) { return "i" },
         rep: function(v) { return v.str; },
         stringRep: function(v) { return v.str; }});

    hs.set(
        types.BigDecimal,
        {tag: function(v) { return "f" },
         rep: function(v) { return v.value; },
         stringRep: function(v) { return v.value; }});

    hs.set(
        Boolean,
        {tag: function(v) { return "?"; },
         rep: function(v) { return v; },
         stringRep: function(v) { return v.toString(); }});

    hs.set(
        Array,
        {tag: function(v) { return "array"; },
         rep: function(v) { return v; },
         stringRep: function(v) { return null; }});

    hs.set(
        Object,
        {tag: function(v) { return "map"; },
         rep: function(v) { return v; },
         stringRep: function(v) { return null; }});

    hs.set(
        Date,
        {tag: function(v) { return "t"; },
         rep: function(v) { return v.valueOf(); },
         stringRep: function(v) {
             return v.getUTCFullYear()+"-"+handlers.padZeros(v.getUTCMonth()+1,2)+"-"+
                    handlers.padZeros(v.getUTCDate(),2)+"T"+handlers.padZeros(v.getUTCHours(),2)+":"+
                    handlers.padZeros(v.getUTCMinutes(),2)+":"+handlers.padZeros(v.getUTCSeconds(),2)+"."+
                    handlers.padZeros(v.getUTCMilliseconds(),3)+"Z";
         }});

    hs.set(
        types.Binary,
        {tag: function(v) { return "b"; },
         rep: function(v) { return v.str; },
         stringRep: function(v) { return v.str; }});

    hs.set(
        types.UUID,
        {tag: function(v) { return "u"; },
         rep: function(v) {
             return v.str;
         },
         stringRep: function(v) {
             return v.str;
         }});

    hs.set(
        types.URI,
        {tag: function(v) { return "r"; },
         rep: function(v) { return v.uri; },
         stringRep: function(v) { return v.uri; }});

    hs.set(
        types.Keyword,
        {tag: function(v) { return ":"; },
         rep: function(v) { return v.name; },
         stringRep: function(v, h) { return h.rep(v); }});

    hs.set(
        types.Symbol,
        {tag: function(v) { return "$"; },
         rep: function(v) { return v.name; },
         stringRep: function(v, h) { return h.rep(v); }});

    hs.set(
        types.Quote,
        {tag: function(v) { return "'"; },
         rep: function(v) { return v.obj; },
         stringRep: function(v) { return null; }});

    hs.set(
        types.TaggedValue,
        {tag: function(v) { return v.tag; },
         rep: function(v) { return v.rep; },
         stringRep: function(v) { return null; }});

    hs.set(
        types.TransitSet,
        {tag: function(v) { return "set"; },
         rep: function(v) {
             var arr = [];
             v.forEach(function(key, set) {
                 arr.push(key);
             });
             return types.taggedValue("array", arr);
         },
         stringRep: function(v) { return null; }});

    hs.set(
        types.TransitMap,
        {tag: function(v) { return "cmap"; },
         rep: function(v) {
             var arr = [];
             v.forEach(function(val, key, map) {
                 arr.push(key);
                 arr.push(val);
             });
             return types.taggedValue("array", arr);
         },
         stringRep: function(v) { return null; }});

    hs.set(
        types.List,
        {tag: function(v) { return "list"; },
         rep: function(v) { return types.taggedValue("array", v.arr); },
         stringRep: function(v) { return null; }});

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
