// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("transit.impl.reader");
goog.require("transit.caching");
goog.require("transit.decoder");

/**
 * A JSON unmarshaller
 * @constructor
 */
transit.impl.reader.JSONUnmarshaller = function() {
    this.decoder = new transit.decoder.Decoder();
};

/**
 * @param {string} str a JSON string
 * @param {transit.caching.ReadCache} cache a read cache
 * @returns {Object}
 */
transit.impl.reader.JSONUnmarshaller.prototype.unmarshal = function(str, cache) {
    return this.decoder.decode(JSON.parse(str), cache);
};

/**
 * A transit reader
 * @constructor
 * @param {transit.impl.reader.JSONUnmarshaller} unmarshaller
 * @param {Object} options
 */
transit.impl.reader.Reader = function(unmarshaller, options) {
    this.unmarshaller = unmarshaller;
    this.options = options || {};
    this.cache = this.options.cache ? this.options.cache : new transit.caching.ReadCache();
};

/**
 * @param {string} str a string to be read
 * @returns {Object}
 */
transit.impl.reader.Reader.prototype.read = function(str) {
    var ret = this.unmarshaller.unmarshal(str, this.cache)
    this.cache.clear();
    return ret;
};
