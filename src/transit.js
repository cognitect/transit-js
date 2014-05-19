// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("transit");
goog.require("transit.reader"),
goog.require("transit.writer");

/**
 * Create a transit reader instance.
 * @export
 * @param {string|null} type type of reader to construct.
 *     only "json" supported.
 * @param {Object|null} opts reader options
 * @return {transit.reader.Reader}
 */
transit.reader = function(type, opts) {
    if(type === "json" || type == null) {
        type = "json";
        var unmarshaller = new transit.reader.JSONUnmarshaller();
        return new transit.reader.Reader(unmarshaller, options);
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
 * @return {tranist.writer.Writer}
 */
transit.writer = function(type, opts) {
    if(type === "json" || type == null) {
        type = "json";
        var marshaller = new transit.writer.JSONMarshaller(opts);
        return new transit.writer.Writer(marshaller, opts);
    } else {
        var err = new Error("Type must be \"json\"");
        err.data = {type: type};
        throw err;
    }
}
