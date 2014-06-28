// Copyright (c) Cognitect, Inc.
// All rights reserved.

goog.provide("com.cognitect.transit.util");
goog.require("goog.object");

goog.scope(function() {

var util    = com.cognitect.transit.util,
    gobject = goog.object;

if(typeof Object.keys != undefined) {
    util.objectKeys = function(obj) {
        return Object.keys(obj);
    };
} else {
    util.objectKeys = function(obj) {
        return gobject.getKeys(obj);
    };
}

if(typeof Array.isArray != undefined) {
    util.isArray = function(obj) {
        return Array.isArray(obj);
    };
} else {
    util.isArray = function(obj) {
        return goog.typeOf(obj) === "array";
    };
}

});
