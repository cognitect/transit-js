var reader = require("transit/reader"),
    writer = require("transit/writer");

exports = {
  read: reader.read,
  write: writer.write
};
