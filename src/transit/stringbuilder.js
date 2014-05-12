// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

function StringBuilder() {
    this.buffer = "";
}

StringBuilder.prototype = {
    write: function(data) {
        this.buffer += data;
    },

    flush: function() {
        var ret = this.buffer
        this.buffer = "";
        return ret;
    }
};

function stringBuilder() {
    return new StringBuilder();
}

module.exports = {
    StringBuilder: StringBuilder,
    stringBuilder: stringBuilder
};
