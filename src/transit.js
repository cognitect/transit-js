// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("transit");
goog.require("transit.impl.reader");
goog.require("transit.impl.writer");
goog.require("transit.types");
goog.require("transit.eq");

/** @define {boolean} */
var NODE_TARGET = false;

/**
 * Create a transit reader instance.
 * @param {string|null} type type of reader to construct.
 *     only "json" supported.
 * @param {Object|null} opts reader options
 * @return {transit.impl.reader.Reader}
 */
transit.reader = function(type, opts) {
    if(type === "json" || type == null) {
        type = "json";
        var unmarshaller = new transit.impl.reader.JSONUnmarshaller();
        return new transit.impl.reader.Reader(unmarshaller, opts);
    } else {
        throw new Error("Cannot create reader of type " + type);
    }
};
transit["reader"] = transit.reader;

/**
 * Create a transit writer instance.
 * @param {string|null} type type of writer to construct.
 *     only "json" supported.
 * @param {Object|null} opts writer options
 * @return {transit.impl.writer.Writer}
 */
transit.writer = function(type, opts) {
    if(type === "json" || type == null) {
        type = "json";
        var marshaller = new transit.impl.writer.JSONMarshaller(opts);
        return new transit.impl.writer.Writer(marshaller, opts);
    } else {
        var err = new Error("Type must be \"json\"");
        err.data = {type: type};
        throw err;
    }
};
transit["writer"] = transit.writer;

transit["long"]    = transit.types.intValue;
transit["uuid"]    = transit.types.uuid;
transit["bigdec"]  = transit.types.bigDecimalValue;
transit["keyword"] = transit.types.keyword;
transit["symbol"]  = transit.types.symbol;
transit["binary"]  = transit.types.binary;
transit["uri"]     = transit.types.uri;
transit["map"]     = transit.types.map;
transit["set"]     = transit.types.set;
transit["list"]    = transit.types.list;
transit["quoted"]  = transit.types.quoted;
transit["tagged"]  = transit.types.tagged;
transit["hash"]    = transit.eq.hashCode;
transit["equals"]  = transit.eq.equals;

if(NODE_TARGET) {
    module.exports = {
        reader:  transit.reader,
        writer:  transit.writer,
        "long":  transit.types.intValue,
        uuid:    transit.types.uuid,
        bigdec:  transit.types.bigDecimalValue,
        keyword: transit.types.keyword,
        symbol:  transit.types.symbol,
        binary:  transit.types.binary,
        uri:     transit.types.uri,
        map:     transit.types.map,
        set:     transit.types.set,
        list:    transit.types.list,
        quoted:  transit.types.quoted,
        tagged:  transit.types.taggedValue,
        hash:    transit.eq.hashCode,
        equals:  transit.eq.equals
    };
}
