// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var t = require("./types.js"),
    defaultHandlers = {},
    ctorGuid = 0,
    transitCtorGuidProperty = "com$cognitect$transit$ctor$guid";

function typeTag(ctor) {
  if(ctor == null) {
    return "null";
  }

  if(ctor === String) {
    return "string";
  }

  if(ctor === Boolean) {
    return "boolean";
  }

  if(ctor === Number) {
    return "number";
  }

  if(ctor === Array) {
    return "array";
  }

  if(ctor === Object) {
    return "map";
  }

  ctor[transitCtorGuidProperty] = ++ctorGuid;
  return ctor[transitCtorGuidProperty]
}

function registerHandler(ctor, handler, handlers) {
  handlers[typeTag(ctor)] = handler;
}

function constructor(x) {
  if(x == null) {
    return null;
  }
  return x.constructor;
}

registerHandler(
  null,
  {tag: function(v) { return "_"; },
   rep: function(v) { return null; },
   stringRep: function(v) { return "null"; }},
  defaultHandlers);

registerHandler(
  String,
  {tag: function(v) { return "s"; },
   rep: function(v) { return v; },
   stringRep: function(v) { return v; }},
  defaultHandlers);

registerHandler(
  Number,
  {tag: function(v) { return "i" },
   rep: function(v) { return null; },
   stringRep: function(v) {
     return v;
   }},
  defaultHandlers);

registerHandler(
  Boolean,
  {tag: function(v) { return "?"; },
   rep: function(v) { return null; },
   stringRep: function(v) { v ? "t" : "f" }},
  defaultHandlers);

registerHandler(
  Array,
  {tag: function(v) { return "array"; },
   rep: function(v) { return v; },
   stringRep: function(v) { return null; } },
  defaultHandlers);

registerHandler(
  Object,
  {tag: function(v) { return "map"; },
   rep: function(v) { return v; },
   stringRep: function(v) { return null; } },
  defaultHandlers);

module.exports = {
  typeTag: typeTag,
  constructor: constructor,
  registerHandler: registerHandler,
  defaultHandlers: defaultHandlers
};
