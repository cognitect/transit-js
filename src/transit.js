// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

var reader = require("./transit/reader.js"),
    writer = require("./transit/writer.js");

module.exports = {
  reader: reader.reader,
  read: reader.read,
  writer: writer.writer,
  write: writer.write
};
