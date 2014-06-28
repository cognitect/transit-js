// Copyright (c) Cognitect, Inc.
// All rights reserved.

goog.provide("com.cognitect.transit.stringbuilder");

goog.scope(function() {

var sb = com.cognitect.transit.stringbuilder;

/**
 * @constructor
 */
sb.StringBuilder = function() {
    this.buffer = "";
};

sb.StringBuilder.prototype.write = function(data) {
    this.buffer += data;
};

sb.StringBuilder.prototype.flush = function() {
    var ret = this.buffer
    this.buffer = "";
    return ret;
};

});
