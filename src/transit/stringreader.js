// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

function StringReader(str) {
  this.str = str;
};

StringReader.prototype = {
  read: function() {
    return this.str;
  }
};

module.exports = {
  StringReader: StringReader,
  stringReader: stringReader
};
