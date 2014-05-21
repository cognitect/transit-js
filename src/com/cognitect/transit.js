// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("com.cognitect.transit");
goog.require("com.cognitect.transit.impl.reader");
goog.require("com.cognitect.transit.impl.writer");
goog.require("com.cognitect.transit.types");
goog.require("com.cognitect.transit.eq");

/** @define {boolean} */
var NODE_TARGET = false;

goog.scope(function() {

var transit = com.cognitect.transit,
    reader  = com.cognitect.transit.impl.reader,
    writer  = com.cognitect.transit.impl.writer,
    types   = com.cognitect.transit.types,
    eq      = com.cognitect.transit.eq;

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
        var unmarshaller = new reader.JSONUnmarshaller();
        return new reader.Reader(unmarshaller, opts);
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
        var marshaller = new writer.JSONMarshaller(opts);
        return new writer.Writer(marshaller, opts);
    } else {
        var err = new Error("Type must be \"json\"");
        err.data = {type: type};
        throw err;
    }
};
transit["writer"] = transit.writer;

transit["date"]    = types.date;
transit["long"]    = types.intValue;
transit["uuid"]    = types.uuid;
transit["bigdec"]  = types.bigDecimalValue;
transit["keyword"] = types.keyword;
transit["symbol"]  = types.symbol;
transit["binary"]  = types.binary;
transit["uri"]     = types.uri;
transit["map"]     = types.map;
transit["set"]     = types.set;
transit["list"]    = types.list;
transit["quoted"]  = types.quoted;
transit["tagged"]  = types.tagged;
transit["hash"]    = eq.hashCode;
transit["equals"]  = eq.equals;

if(NODE_TARGET) {
    module.exports = {
        reader:  transit.reader,
        writer:  transit.writer,
        date:    types.date,
        "long":  types.intValue,
        uuid:    types.uuid,
        bigdec:  types.bigDecimalValue,
        keyword: types.keyword,
        symbol:  types.symbol,
        binary:  types.binary,
        uri:     types.uri,
        map:     types.map,
        set:     types.set,
        list:    types.list,
        quoted:  types.quoted,
        tagged:  types.taggedValue,
        hash:    eq.hashCode,
        equals:  eq.equals
    };
}

});
