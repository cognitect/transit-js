// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("transit.stringbuilder");

/**
 * @constructor
 */
transit.stringbuilder.StringBuilder = function() {
    this.buffer = "";
};

transit.stringbuilder.StringBuilder.prototype.write = function(data) {
    this.buffer += data;
};

transit.stringbuilder.StringBuilder.prototype.flush = function() {
    var ret = this.buffer
    this.buffer = "";
    return ret;
};

