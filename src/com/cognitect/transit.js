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

/**
 * @class transit
 */
var transit = com.cognitect.transit;

var reader  = com.cognitect.transit.impl.reader,
    writer  = com.cognitect.transit.impl.writer,
    decoder = com.cognitect.transit.impl.decoder,
    types   = com.cognitect.transit.types,
    eq      = com.cognitect.transit.eq;

/**
 * Create a transit reader instance.
 * @method transit.reader
 * @param {string|null} type type of reader to construct.
 *     Default to "json". For verbose mode supply "json-verbose".
 * @param {Object|null} opts reader options. A JavaScript object to
 *     customize the writer Valid entries include "defaultDecoder",
 *     and "decoders". "defaultDecoder" should be JavaScript function
 *     taking two arguments, the first is the tag, the second the
 *     value. "decoders" should be an object of tags to handle. The
 *     values are functions that will receive the value of matched
 *     tag.
 * @return {transit.reader} A transit reader.
 */
transit.reader = function(type, opts) {
    if(type === "json" || type === "json-verbose" || type == null) {
        type = "json";
        var unmarshaller = new reader.JSONUnmarshaller(opts);
        return new reader.Reader(unmarshaller, opts);
    } else {
        throw new Error("Cannot create reader of type " + type);
    }
};

/**
 * Create a transit writer instance.
 * @method transit.writer
 * @param {String|null} type type of writer to construct.
 *     Defaults to "json". For verbose mode supply "json-verbose".
 * @param {Object|null} opts writer options. A JavaScript object to
 *     customize the writer. Takes "handlers", a JavaScript array containing
 *     and even number of entries. Every two entries should be a pair - a
 *     JavaScript constructor and transit writer handler instance.
 * @return {transit.writer} A transit writer.
 */
transit.writer = function(type, opts) {
    if(type === "json" || type === "json-verbose" || type == null) {
        if(type === "json-verbose") {
            if(opts == null) opts = {};
            opts["verbose"] = true;
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

/**
 * Create a transit writer handler.
 * @method transit.makeHandler
 * @param {Object} obj An object containing 3 functions, tag, rep and stringRep.
 *    "tag" should return a string representing the tag to be written on the wire.
 *    "rep" should return the representation on the wire. "stringRep" is should return
 *    the string representation of the value.
 * @return {transit.handler} A transit write handler.
 */
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

/**
 * Create a transit date.
 * @method transit.date
 * @param {Number|String} A number or string representing milliseconds since epoch.
 * @return {Date} A JavaScript Date.
 */
transit.date = types.date;

/**
 * Create a transit 64bit integer. Will return a JavaScript
 *     number if a string that represents an integer value in the 53bit
 *     range.
 * @method transit.integer
 * @param {Number} s A string representing an integer in the 64bit range.
 * @return {transit.integer} A 64bit long.
 */
transit.integer = types.intValue;

/**
 * Test if an object is a transit 64 bit integer.
 * @method transit.isInteger
 * @params {Object} x Any JavaScript value.
 * @return {Boolean} true if the value is a transit 64bit integer, false otherwise.
 */
transit.isInteger = types.intValue;

/**
 * Create transit UUID from high and low 64 bits. These integer values
 *      can be constructed with transit.integer.
 * @method transit.uuid
 * @param {transit.integer} high The high 64 bits.
 * @param {transit.integer} low The low 64 bits.
 * @return {transit.uuid} A transit UUID.
 */
transit.uuid = types.uuid;

/**
 * Test if an object is a transit UUID.
 * @method transit.isUUID
 * @param {Object} x Any JavaScript value.
 * @return {Boolean} true if the vlaue is a transit UUID instance, false otherwise.
 */
transit.isUUID = types.isUUID;

/**
 * Create a transit big decimal.
 * @method transit.bigdec
 * @param {String} s A string representing an arbitrary precisions decimal value.
 * @return {transit.bigdec} A transit big decimal.
 */
transit.bigdec =  types.bigDecimalValue;

/**
 * Test if an object is a transit big decimal.
 * @method transit.isBigDecimal
 * @param {Object} x Any JavaScript value.
 * @return {Boolean} true if x is a transit big decimal, false otherwise.
 */
transit.isBigDecimal = types.isBigDecimal;

/**
 * Create transit keyword.
 * @method transit.keyword
 * @param {String} name A string.
 * @return {transit.keyword} A transit keyword.
 */
transit.keyword = types.keyword;

/**
 * Test if an object is a transit keyword.
 * @method transit.isKeyword
 * @param {Object} x Any JavaScript value.
 * @return {Boolean} true if x is a transit keyword, false otherwise.
 */
transit.isKeyword = types.isKeyword;

/**
 * Create a transit symbol.
 * @method transit.symbol
 * @param {s} name A string.
 * @return {transit.symbol} A transit symbol instance.
 */
transit.symbol = types.symbol;

/**
 * Test if an object is a transit symbol
 * @method transit.isSymbol
 * @param {Object} x Any JavaScript value.
 * @return {Boolean} true if x is a transit symbol, false otherwise.
 */
transit.isSymbol = types.isSymbol;

/**
 * Create transit binary blob.
 * @method transit.binary
 * @params {String} s A base64 encoded string.
 * @return {transit.binary} A transit binary blob instance.
 */
transit.binary = types.binary;

/**
 * Test if an object is a transit binary blob.
 * @method transit.isBinary
 * @param {Object} x Any JavaScript value.
 */
transit.isBinary = types.isBinary;

/**
 * Create a transit URI.
 * @method transit.uri
 * @param {String} A string representing a valid URI.
 * @return {transit.uri} A transit URI.
 */
transit.uri = types.uri;

/**
 * Test if an object is a transit URI.
 * @method transit.isURI
 * @params {Object} Any JavaScript value.
 * @return {Boolean} true if x is a transit symbol, false otherwise.
 */
transit.isURI = types.isURI;

/**
 * Create a transit hash map. Transit maps satisfy the current version
 *     of the ECMAScript 6 Map specification.
 * @method transit.map
 * @params {Array} xs A JavaScript array of alternating key value pairs.
 * @return {transit.map} A transit map.
 */
transit.map = types.map;

/**
 * Test if an object is a transit map.
 * @method transit.isMap
 * @params {Object} x Any JavaScript value.
 * @return {Boolean} true if x is a transit map, false otherwise.
 */
transit.isMap = types.isMap;

/**
 * Create a transit set. Transit sets satisfy the current version of the
 *     of the ECMAScript 6 Set specification.
 * @method transit.set
 * @param {Array} xs A JavaScript array of values.
 * @return {transit.set} A transit set.
 */
transit.set = types.set;

/**
 * Test if an object is a transit set.
 * @method transit.isSet
 * @params {Object} x Any JavaScript value.
 * @return {Boolean} true if x is a transit set, false otherwise.
 */
transit.isSet = types.isSet;

/**
 * Create a transit list.
 * @method transit.list
 * @param {Array} A JavaScript array.
 * @return {transit.list} A transit list.
 */
transit.list = types.list;

/**
 * Test if an object is a transit list.
 * @method transit.list
 * @param {Object} x Any JavaScript value.
 * @return {Boolean} true if x is a transit list, false otherwise.
 */
transit.isList = types.isList;

/**
 * Create a transit quoted value.
 * @method transit.quoted
 * @param {Object} x Any JavaScript value.
 * @return {transit.quoted} A transit quoted value.
 */
transit.quoted = types.quoted;

/**
 * Test if an object is a transit quoted value.
 * @method transit.isQuoted
 * @param {Object} x Any JavaScript value.
 * @return {Boolean} true if x is a transit value, false otherwise.
 */
transit.isQuoted = types.isQuoted;

/**
 * Create a transit tagged value.
 * @method transit.tagged
 * @param {String} tag A tag.
 * @param {Object} value A JavaScrpt array, object, or string.
 * @return {transit.tagged} A transit tagged value.
 */
transit.tagged = types.taggedValue;

/**
 * Test if an object is a transit tagged value.
 * @method transit.isTaggedValue
 * @param {Object} x Any JavaScript value.
 * @return {Boolean} true if x is a transit value, false otherwise.
 */
transit.isTaggedValue =  types.isTaggedValue;

/**
 * Create a transit link.
 * @method transit.link
 * @param {Object} obj A JavaScript object which must contain at a
 *     minimum the following keys: href, rel. It may optionally include
 *     name, render, and prompt. href must be a transit.uri, all other
 *     values are strings, and render must be either "image" or "link".
 * @return {Object} A transit link.
 */
transit.link = types.link;

/**
 * Test if an object is a transit link.
 * @method transit.isLInk
 * @param {Object} x Any JavaScript object.
 * @return {Boolean} true if x is a transit link, false otherwise.
 */
transit.isLink = types.isLink;

/**
 * Compute the hashCode for any JavaScript object that has been
 *    extend to transit's equality and hashing protocol. JavaScript
 *    primitives and transit value are already extended to this protocol.
 *    Custom types may be extended to the protocol via transit.extenToEQ.
 * @method transit.hash
 * @param {Object} x Any JavaScript object that has been extended to
 *    transit's equality and hashing protocol.
 * @return {Number} Returns JavaScript number - semantically a 32bit integer.
 */
transit.hash = eq.hashCode;

/**
 * Test whether two JavaScript values are equal. The values to be tested
 *    should be extended to transit's equality and hasing protocol. JavaScript
 *    natives and transit value have already been extended to the protocol.
 *    Custom types may be extended via transit.extendToEQ.
 * @param {Object} x A JavaScript object
 * @param {Object} y A JavaScript object
 * @return {Boolean} true if the x and y are equal, false otherwise.
 */
transit.equals = eq.equals;

/**
 * Extend an object to hashing and equality required by
 *     transit maps and sets. Only required for custom
 *     types, JavaScript primitive types and transit
 *     types are handled.
 * @method transit.extendToEQ
 * @param {Object} x A JavaScript object, will be mutated.
 * @return {Object} x
 */
transit.extendToEQ = eq.extendToEQ;

/* The following are undocumented for now */
transit.decoder =        decoder.decoder;
transit.UUIDfromString = types.UUIDfromString;
transit.randomUUID =     types.randomUUID;
transit.stringableKeys = writer.stringableKeys;

if(BROWSER_TARGET) {
    goog.exportSymbol("transit.reader",         transit.reader);
    goog.exportSymbol("transit.writer",         transit.writer);
    goog.exportSymbol("transit.makeBuilder",    transit.makeBuilder);
    goog.exportSymbol("transit.makeHandler",    transit.makeHandler);
    goog.exportSymbol("transit.date",           types.date);
    goog.exportSymbol("transit.integer",        types.intValue);
    goog.exportSymbol("transit.isInteger",      types.isInteger);
    goog.exportSymbol("transit.uuid",           types.uuid);
    goog.exportSymbol("transit.isUUID",         types.isUUID);
    goog.exportSymbol("transit.bigdec",         types.bigDecimalValue);
    goog.exportSymbol("transit.isBigDecimal",   types.isBigDecimal);
    goog.exportSymbol("transit.keyword",        types.keyword);
    goog.exportSymbol("transit.isKeyword",      types.isKeyword);
    goog.exportSymbol("transit.symbol",         types.symbol);
    goog.exportSymbol("transit.isSymbol",       types.isSymbol);
    goog.exportSymbol("transit.binary",         types.binary);
    goog.exportSymbol("transit.isBinary",       types.isBinary);
    goog.exportSymbol("transit.uri",            types.uri);
    goog.exportSymbol("transit.isURI",          types.isURI);
    goog.exportSymbol("transit.map",            types.map);
    goog.exportSymbol("transit.isMap",          types.isMap);
    goog.exportSymbol("transit.set",            types.set);
    goog.exportSymbol("transit.isSet",          types.isSet);
    goog.exportSymbol("transit.list",           types.list);
    goog.exportSymbol("transit.isList",         types.isList);
    goog.exportSymbol("transit.quoted",         types.quoted);
    goog.exportSymbol("transit.isQuoted",       types.isQuoted);
    goog.exportSymbol("transit.tagged",         types.taggedValue);
    goog.exportSymbol("transit.isTaggedValue",  types.idTaggedValue);
    goog.exportSymbol("transit.link",           types.link);
    goog.exportSymbol("transit.isLink",         types.isLink);
    goog.exportSymbol("transit.hash",           eq.hashCode);
    goog.exportSymbol("transit.equals",         eq.equals);
    goog.exportSymbol("transit.extendToEQ",     eq.extendToEQ);
    goog.exportSymbol("transit.decoder",        decoder.decoder);
    goog.exportSymbol("transit.UUIDfromString", types.UUIDfromString);
    goog.exportSymbol("transit.randomUUID",     types.randomUUID);
    goog.exportSymbol("transit.stringableKeys", writer.stringableKeys);
}

if(NODE_TARGET) {
    module.exports = {
        reader:         transit.reader,
        writer:         transit.writer,
        makeBuilder:    transit.makeBuilder,
        makeHandler:    transit.makeHandler,
        date:           types.date,
        integer:        types.intValue,
        isInteger:      types.isInteger,
        uuid:           types.uuid,
        isUUID:         types.isUUID,
        bigdec:         types.bigDecimalValue,
        isBigDecimal:   types.isBigDecimal,
        keyword:        types.keyword,
        isKeyword:      types.isKeyword,
        symbol:         types.symbol,
        isSymbol:       types.isSymbol,
        binary:         types.binary,
        isBinary:       types.isBinary,
        uri:            types.uri,
        isURI:          types.isURI,
        map:            types.map,
        isMap:          types.isMap,
        set:            types.set,
        isSet:          types.isSet,
        list:           types.list,
        isList:         types.isList,
        quoted:         types.quoted,
        isQuoted:       types.isQuoted,
        tagged:         types.taggedValue,
        isTaggedValue:  types.isTaggedValue,
        link:           types.link,
        isLink:         types.isLink,
        hash:           eq.hashCode,
        equals:         eq.equals,
        extendToEQ:     eq.extendToEQ,
        decoder:        decoder.decoder,
        UUIDfromString: types.UUIDfromString,
        randomUUID:     types.randomUUID,
        stringableKeys: writer.stringableKeys
    };
}

});
