var reader = require("./transit/reader.js"),
    writer = require("./transit/writer.js");

exports = {
  read: reader.read,
  write: writer.write
};
