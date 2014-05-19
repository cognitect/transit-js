// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("transit.handlers");
goog.require("transit.types");

transit.handlers.ctorGuid         = 0,
transit.handlers.ctorGuidProperty = "com$cognitect$transit$ctor$guid";

transit.handlers.typeTag = function(ctor) {
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
        var tag = ctor[transit.handlers.ctorGuidProperty];
        if(tag == null) {
            ctor[transit.handlers.ctorGuidProperty] = tag = ++transit.handlers.ctorGuid;
        }
        return tag;
    }
};

transit.handlers.constructor = function(x) {
    if(x == null) {
        return null;
    } else {
        return x.constructor;
    }
};

transit.handlers.padZeros = function(n,m) {
    var s = n.toString();
    for(var i = s.length; i < m; i++) {
        s = "0"+s;
    }
    return s;
};

transit.handlers.stringableKeys = function(m) {
    var stringable = false,
    ks = Object.keys(m);

    for(var i = 0; i < ks.length; i++) {
    }

    return true;
};

transit.handlers.defaultHandlers = function(hs) {
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
        transit.types.Integer,
        {tag: function(v) { return "i" },
         rep: function(v) { return v.str; },
         stringRep: function(v) { return v.str; }});

    hs.set(
        transit.types.BigDecimal,
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
             return v.getUTCFullYear()+"-"+transit.handlers.padZeros(v.getUTCMonth()+1,2)+"-"+
                    transit.handlers.padZeros(v.getUTCDate(),2)+"T"+transit.handlers.padZeros(v.getUTCHours(),2)+":"+
                    transit.handlers.padZeros(v.getUTCMinutes(),2)+":"+transit.handlers.padZeros(v.getUTCSeconds(),2)+"."+
                    transit.handlers.padZeros(v.getUTCMilliseconds(),3)+"Z";
         }});

    hs.set(
        transit.types.Binary,
        {tag: function(v) { return "b"; },
         rep: function(v) { return v.str; },
         stringRep: function(v) { return v.str; }});

    hs.set(
        transit.types.UUID,
        {tag: function(v) { return "u"; },
         rep: function(v) {
             return v.str;
         },
         stringRep: function(v) {
             return v.str;
         }});

    hs.set(
        transit.types.URI,
        {tag: function(v) { return "r"; },
         rep: function(v) { return v.uri; },
         stringRep: function(v) { return v.uri; }});

    hs.set(
        transit.types.Keyword,
        {tag: function(v) { return ":"; },
         rep: function(v) { return v.name; },
         stringRep: function(v) { return this.rep(v); }});

    hs.set(
        transit.types.Symbol,
        {tag: function(v) { return "$"; },
         rep: function(v) { return v.name; },
         stringRep: function(v) { return this.rep(v); }});

    hs.set(
        transit.types.Quote,
        {tag: function(v) { return "'"; },
         rep: function(v) { return v.obj; },
         stringRep: function(v) { return null; }});

    hs.set(
        transit.types.TaggedValue,
        {tag: function(v) { return v.tag; },
         rep: function(v) { return v.rep; },
         stringRep: function(v) { return null; }});

    hs.set(
        transit.types.TransitSet,
        {tag: function(v) { return "set"; },
         rep: function(v) {
             var arr = [];
             v.forEach(function(key, set) {
                 arr.push(key);
             });
             return transit.types.taggedValue("array", arr);
         },
         stringRep: function(v) { return null; }});

    hs.set(
        transit.types.TransitMap,
        {tag: function(v) { return "cmap"; },
         rep: function(v) {
             var arr = [];
             v.forEach(function(val, key, map) {
                 arr.push(key);
                 arr.push(val);
             });
             return transit.types.taggedValue("array", arr);
         },
         stringRep: function(v) { return null; }});

    hs.set(
        transit.types.List,
        {tag: function(v) { return "list"; },
         rep: function(v) { return transit.types.taggedValue("array", v.arr); },
         stringRep: function(v) { return null; }});

    return hs;
};

/**
 * @constructor
 */
transit.handlers.Handlers = function() {
    this.handlers = {};
    transit.handlers.defaultHandlers(this);
};

transit.handlers.Handlers.prototype.get = function(ctor) {
    return this.handlers[typeTag(ctor)];
};

transit.handlers.Handlers.prototype.set = function(ctor, handler) {
    this.handlers[typeTag(ctor)] = handler;
};
