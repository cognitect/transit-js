// Copyright 2014 Cognitect. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide("com.cognitect.transit.util");
goog.require("goog.object");

goog.scope(function() {

var util    = com.cognitect.transit.util,
    gobject = goog.object;

if(typeof Object.keys != "undefined") {
    util.objectKeys = function(obj) {
        return Object.keys(obj);
    };
} else {
    util.objectKeys = function(obj) {
        return gobject.getKeys(obj);
    };
}

if(typeof Array.isArray != "undefined") {
    util.isArray = function(obj) {
        return Array.isArray(obj);
    };
} else {
    util.isArray = function(obj) {
        return goog.typeOf(obj) === "array";
    };
}

util.randInt = function(ub) {
    return Math.round(Math.random()*ub);
};

util.randHex = function() {
    return util.randInt(15).toString(16);
};

util.randomUUID = function() {
    var rhex = (0x8 | (0x3 & util.randInt(14))).toString(16),
        ret  =  util.randHex() + util.randHex() + util.randHex() + util.randHex() +
                util.randHex() + util.randHex() + util.randHex() + util.randHex() + "-" +
                util.randHex() + util.randHex() + util.randHex() + util.randHex() + "-" +
                  "4" + util.randHex() + util.randHex() + util.randHex() + "-" +
                 rhex + util.randHex() + util.randHex() + util.randHex() + "-" +
                util.randHex() + util.randHex() + util.randHex() + util.randHex() +
                util.randHex() + util.randHex() + util.randHex() + util.randHex() +
                util.randHex() + util.randHex() + util.randHex() + util.randHex();
    return ret;
};

});
