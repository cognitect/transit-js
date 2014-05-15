// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var t                       = require("./types.js"),
    moment                  = require("moment"),
    ctorGuid                = 0,
    transitCtorGuidProperty = "com$cognitect$transit$ctor$guid";

function typeTag(ctor) {
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
        var tag = ctor[transitCtorGuidProperty];
        if(tag == null) {
            ctor[transitCtorGuidProperty] = tag = ++ctorGuid;
        }
        return tag;
    }
}

function constructor(x) {
    if(x == null) {
        return null;
    } else {
        return x.constructor;
    }
}

function stringableKeys(m) {
    var stringable = false,
    ks = Object.keys(m);

    for(var i = 0; i < ks.length; i++) {
    }

    return true;
}

function defaultHandlers(hs) {
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
        t.Integer,
        {tag: function(v) { return "i" },
         rep: function(v) { return v.str; },
         stringRep: function(v) { return v.str; }});

    hs.set(
        t.BigDecimal,
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
             return moment.utc(v.valueOf()).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
         }});

    hs.set(
        t.Binary,
        {tag: function(v) { return "b"; },
         rep: function(v) { return v.str; },
         stringRep: function(v) { return v.str; }});

    hs.set(
        t.UUID,
        {tag: function(v) { return "u"; },
         rep: function(v) {
             return v.str;
         },
         stringRep: function(v) {
             return v.str;
         }});

    hs.set(
        t.URI,
        {tag: function(v) { return "r"; },
         rep: function(v) { return v.uri; },
         stringRep: function(v) { return v.uri; }});

    hs.set(
        t.Keyword,
        {tag: function(v) { return ":"; },
         rep: function(v) { return v.name; },
         stringRep: function(v) { return this.rep(v); }});

    hs.set(
        t.Symbol,
        {tag: function(v) { return "$"; },
         rep: function(v) { return v.name; },
         stringRep: function(v) { return this.rep(v); }});

    hs.set(
        t.Quote,
        {tag: function(v) { return "'"; },
         rep: function(v) { return v.obj; },
         stringRep: function(v) { return null; }});

    hs.set(
        t.TaggedValue,
        {tag: function(v) { return v.tag; },
         rep: function(v) { return v.rep; },
         stringRep: function(v) { return null; }});

    hs.set(
        t.TransitSet,
        {tag: function(v) { return "set"; },
         rep: function(v) {
             var arr = [];
             v.forEach(function(key, set) {
                 arr.push(key);
             });
             return t.taggedValue("array", arr);
         },
         stringRep: function(v) { return null; }});

    hs.set(
        t.TransitMap,
        {tag: function(v) { return "cmap"; },
         rep: function(v) {
             var arr = [];
             v.forEach(function(val, key, map) {
                 arr.push(key);
                 arr.push(val);
             });
             return t.taggedValue("array", arr);
         },
         stringRep: function(v) { return null; }});

    hs.set(
        t.List,
        {tag: function(v) { return "list"; },
         rep: function(v) { return t.taggedValue("array", v.arr); },
         stringRep: function(v) { return null; }});

    return hs;
}

function Handlers() {
    this.handlers = {};
}

Handlers.prototype.get = function(ctor) {
    return this.handlers[typeTag(ctor)];
}

Handlers.prototype.set = function(ctor, handler) {
    this.handlers[typeTag(ctor)] = handler;
}

function handlers(hs) {
    var ret = new Handlers();
    defaultHandlers(ret);
    return ret;
}

module.exports = {
    typeTag: typeTag,
    constructor: constructor,
    handlers: handlers
};
