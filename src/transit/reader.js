// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var caching = require("./caching"),
    decoder = require("./decoder");

function JSONUnmarshaller(stream) {
  this.stream = stream;
};

JSONUnmarshaller.prototype = {
  unmarshal: function(cache) {
    var json = JSON.parse(this.stream.read());
    return decoder.decode(json, cache);
  }
}

function Reader(unmarshaller, options) {
  this.unmarshaler = unmarshaler;
  this.options = options || {};
}

function reader(stream, type, options) {
  if(type == "json") {
    unmarshaler = JSONUnmarshaller(stream);
    return new Reader(unmarshaler, options);
  } else {
    throw new Error("Cannot create reader of type " + type);
  }
}

function read(reader, opts) {
  return reader.unmarshaler.unmarshal(caching.readCache());
}

module.exports = {
  reader: reader,
  read: read
};
