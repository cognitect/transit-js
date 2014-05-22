// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("com.cognitect.transit.impl.reader");
goog.require("com.cognitect.transit.caching");
goog.require("com.cognitect.transit.decoder");

goog.scope(function() {

var reader  = com.cognitect.transit.impl.reader,
    caching = com.cognitect.transit.caching,
    decoder = com.cognitect.transit.decoder;

/**
 * A JSON unmarshaller
 * @constructor
 */
reader.JSONUnmarshaller = function(opts) {
    this.decoder = new decoder.Decoder(opts);
};

/**
 * @param {string} str a JSON string
 * @param {caching.ReadCache} cache a read cache
 * @returns {Object}
 */
reader.JSONUnmarshaller.prototype.unmarshal = function(str, cache) {
    return this.decoder.decode(JSON.parse(str), cache);
};

/**
 * A transit reader
 * @constructor
 * @param {reader.JSONUnmarshaller} unmarshaller
 * @param {Object} options
 */
reader.Reader = function(unmarshaller, options) {
    this.unmarshaller = unmarshaller;
    this.options = options || {};
    this.cache = this.options["cache"] ? this.options["cache"] : new caching.ReadCache();
};

/**
 * @param {string} str a string to be read
 * @returns {Object}
 */
reader.Reader.prototype.read = function(str) {
    var ret = this.unmarshaller.unmarshal(str, this.cache)
    this.cache.clear();
    return ret;
};
reader.Reader.prototype["read"] = reader.Reader.prototype.read;

});
