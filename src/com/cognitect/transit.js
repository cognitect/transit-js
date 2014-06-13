// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("com.cognitect.transit");
goog.require("com.cognitect.transit.impl.reader");
goog.require("com.cognitect.transit.impl.writer");
goog.require("com.cognitect.transit.types");
goog.require("com.cognitect.transit.eq");
goog.require("com.cognitect.transit.impl.decoder");

/** @define {boolean} */
var NODE_TARGET = false;

/** @define {boolean} */
var BROWSER_TARGET = false;

goog.scope(function() {

var transit = com.cognitect.transit,
    reader  = com.cognitect.transit.impl.reader,
    writer  = com.cognitect.transit.impl.writer,
    decoder = com.cognitect.transit.impl.decoder,
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
        var unmarshaller = new reader.JSONUnmarshaller(opts);
        return new reader.Reader(unmarshaller, opts);
    } else {
        throw new Error("Cannot create reader of type " + type);
    }
};

/**
 * Create a transit writer instance.
 * @param {string|null} type type of writer to construct.
 *     only "json" supported.
 * @param {Object|null} opts writer options
 * @return {transit.impl.writer.Writer}
 */
transit.writer = function(type, opts) {
    if(type === "json" || type === "json-verbose" || type == null) {
        if(type === "json-verbose") {
            if(opts == null) opts = {};
            opts["humanMode"] = true;
        }
        type = "json";
        var marshaller = new writer.JSONMarshaller(opts);
        return new writer.Writer(marshaller, opts);
    } else {
        var err = new Error("Type must be \"json\"");
        err.data = {type: type};
        throw err;
    }
};

transit.makeHandler = function(obj) {
    var Handler = function(){};
    Handler.prototype.tag = obj["tag"];
    Handler.prototype.rep = obj["rep"];
    Handler.prototype.stringRep = obj["stringRep"];
    return new Handler();
};

transit.makeBuilder = function(obj) {
    var Builder = function(){};
    Builder.prototype.init = obj["init"];
    Builder.prototype.add = obj["add"];
    Builder.prototype.finalize = obj["finalize"];
    return new Builder();
};

transit.date =     types.date;
transit.integer =  types.intValue;
transit.uuid =     types.uuid;
transit.bigdec =   types.bigDecimalValue;
transit.keyword =  types.keyword;
transit.symbol =   types.symbol;
transit.binary =   types.binary;
transit.uri =      types.uri;
transit.map =      types.map;
transit.set =      types.set;
transit.list =     types.list;
transit.quoted =   types.quoted;
transit.tagged =   types.taggedValue;
transit.hash =     eq.hashCode;
transit.equals =   eq.equals;
transit.decoder =  decoder.decoder;
transit.UUIDfromString = types.UUIDfromString;
transit.randomUUID = types.randomUUID;

if(BROWSER_TARGET) {
    goog.exportSymbol("transit.reader",  transit.reader);
    goog.exportSymbol("transit.writer",  transit.writer);
    goog.exportSymbol("transit.makeBuilder", transit.makeBuilder);
    goog.exportSymbol("transit.makeHandler", transit.makeHandler);
    goog.exportSymbol("transit.date",    types.date);
    goog.exportSymbol("transit.integer", types.intValue);
    goog.exportSymbol("transit.uuid",    types.uuid);
    goog.exportSymbol("transit.bigdec",  types.bigDecimalValue);
    goog.exportSymbol("transit.keyword", types.keyword);
    goog.exportSymbol("transit.symbol",  types.symbol);
    goog.exportSymbol("transit.binary",  types.binary);
    goog.exportSymbol("transit.uri",     types.uri);
    goog.exportSymbol("transit.map",     types.map);
    goog.exportSymbol("transit.set",     types.set);
    goog.exportSymbol("transit.list",    types.list);
    goog.exportSymbol("transit.quoted",  types.quoted);
    goog.exportSymbol("transit.tagged",  types.taggedValue);
    goog.exportSymbol("transit.hash",    eq.hashCode);
    goog.exportSymbol("transit.equals",  eq.equals);
    goog.exportSymbol("transit.decoder", decoder.decoder);
    goog.exportSymbol("transit.UUIDfromString", types.UUIDfromString);
    goog.exportSymbol("transit.randomUUID", types.randomUUID);
}

if(NODE_TARGET) {
    module.exports = {
        reader:  transit.reader,
        writer:  transit.writer,
        makeBuilder:  transit.makeBuilder,
        makeHandler:  transit.makeHandler,
        date:    types.date,
        integer: types.intValue,
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
        equals:  eq.equals,
        decoder: decoder.decoder,
        UUIDfromString: types.UUIDfromString,
        randomUUID: types.randomUUID
    };
}

});
