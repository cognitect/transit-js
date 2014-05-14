// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var caching = require("./caching"),
    decoder = require("./decoder");

function JSONUnmarshaller() {
    this.decoder = decoder.decoder();
}

JSONUnmarshaller.prototype = {
    unmarshal: function(x, cache) {
        return this.decoder.decode(JSON.parse(x), cache);
    }
};

function Reader(unmarshaller, options) {
    this.unmarshaller = unmarshaller;
    this.options = options || {};
    this.cache = this.options.cache ? this.options.cache : caching.readCache();
}

Reader.prototype.read = function(str) {
    var ret = this.unmarshaller.unmarshal(str, this.cache)
    this.cache.clear();
    return ret;
}

function reader(type, options) {
    if(type === "json" || type == null) {
        type = "json";
        var unmarshaller = new JSONUnmarshaller();
        return new Reader(unmarshaller, options);
    } else {
        throw new Error("Cannot create reader of type " + type);
    }
}

module.exports = {
    reader: reader
};
