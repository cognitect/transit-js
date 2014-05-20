// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("transit");
goog.require("transit.impl.reader");
goog.require("transit.impl.writer");

/** @define {boolean} */
var NODE_TARGET = false;

/**
 * Create a transit reader instance.
 * @export
 * @param {string|null} type type of reader to construct.
 *     only "json" supported.
 * @param {Object|null} opts reader options
 * @return {transit.impl.reader.Reader}
 */
transit.reader = function(type, opts) {
    if(type === "json" || type == null) {
        type = "json";
        var unmarshaller = new transit.impl.reader.JSONUnmarshaller();
        return new transit.impl.reader.Reader(unmarshaller, options);
    } else {
        throw new Error("Cannot create reader of type " + type);
    }
};

/**
 * Create a transit writer instance.
 * @export
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

if(NODE_TARGET) {
    module.exports = {
        reader: transit.reader,
        writer: transit.writer
    };
}
