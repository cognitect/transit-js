// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var caching = require("./caching"),
decoder = require("./decoder");

function JSONUnmarshaller(stream) {
    this.stream = stream;
    this.decoder = decoder.decoder();
};

JSONUnmarshaller.prototype = {
    unmarshal: function(cache) {
        var json = JSON.parse(this.stream.read());
        return this.decoder.decode(json, cache);
    }
}

function Reader(unmarshaller, options) {
    this.unmarshaller = unmarshaller;
    this.options = options || {};
}

function reader(stream, type, options) {
    if(type == "json") {
        var unmarshaller = new JSONUnmarshaller(stream);
        return new Reader(unmarshaller, options);
    } else {
        throw new Error("Cannot create reader of type " + type);
    }
}

function read(reader, opts) {
    var cache = (opts && opts.cache) || caching.readCache();
    return reader.unmarshaller.unmarshal(cache);
}

module.exports = {
    reader: reader,
    read: read
};
