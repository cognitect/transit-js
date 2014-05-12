// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

function StringReader(str) {
    this.str = str;
};

StringReader.prototype = {
    on: function(t, cb) {
        if(t === "data") {
            cb(this.str);
            this.str = null;
        }
    }
};

function stringReader(str) {
    return new StringReader(str);
}

module.exports = {
    StringReader: StringReader,
    stringReader: stringReader
};
