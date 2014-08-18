
"use strict";

goog.require("com.cognitect.transit");

var transit = com.cognitect.transit,
    org_reader_func = transit.reader,
    org_writer_func = transit.writer;

transit.reader = function (type, opts) {
    if (type === "msgpack") {
        var json_reader = org_reader_func("json", opts),
            old_read_func = json_reader.read;
        json_reader.read = function (bytes) {
            var unpacked = msgpack.unpack(bytes),
                unpacked_string = JSON.stringify(unpacked);
            return old_read_func.call(json_reader, unpacked_string);
        };
        return json_reader;
    }
    return org_reader_func(type, opts);
};

transit.writer = function (type, opts) {
    if (type === "msgpack") {
        var json_writer = opts === undefined ? org_writer_func("json") : org_writer_func("json", opts),
            old_write_func = json_writer.write;
        json_writer.write = function (obj, opts_i) {
            var transit_json = opts_i === undefined ? old_write_func.call(json_writer, obj) : old_write_func.call(json_writer, obj, opts_i);
            return msgpack.pack(JSON.parse(transit_json));
        };
        return json_writer;
    }
    return org_writer_func(type, opts);
};