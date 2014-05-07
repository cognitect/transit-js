// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var reader = require("./transit/reader.js"),
    writer = require("./transit/writer.js");

exports = {
  read: reader.read,
  write: writer.write
};
