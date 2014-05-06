"use strict";

var url    = require("url"),
    longjs = require("long");

if(typeof Set == "undefined") {
  var Set = require("es6-set");
}

if(typeof Map == "undefined") {
  var Map = require("es6-map");
}

function nullValue() {
  return null;
}

function boolValue(s) {
  return s === "t";
}

function intValue(s) {
  return longjs.fromString(s, false, 10);
}

function floatValue(s) {
  return parseFloat(s);
}

function charValue(s) {
  return s;
}

function Keyword(s) {
  this.s = s;
}

function keyword(s) {
  return new Keyword(s);
}

function Symbol(s) {
  this.s = s;
}

function symbol(s) {
  return new Symbol(s);
}

function UUID(s) {
  this.s = s;
}

function uuid(s) {
  return new UUID(s);
}

function set(arr) {
  return new Set(arr);
}

function map(arr) {
  return new Map(arr);
}

function list(xs) {
  return xs;
}

function date(s) {
  return new Date(s);
}

function byteBuffer(data) {
  return new ByteBuffer(data);
}

function uri(s) {
  return url.parse(s);
}

function ints(xs) {
  return xs;
}

function longs(xs) {
  return xs;
}

function floats(xs) {
  return xs;
}

function doubles(xs) {
  return xs;
}

function bools(xs) {
  return xs;
}

function cmap(xs) {
  return xs;
}

function TaggedValue(tag, value) {
  this.tag = tag;
  this.value = value;
}

function taggedValue(tag, value) {
  return new TaggedValue(tag, value);
}

module.exports = {
  nullValue: nullValue,
  boolValue: boolValue,
  intValue: intValue,
  floatValue: floatValue,
  charValue: charValue,
  keyword: keyword,
  Keyword: Keyword,
  symbol: symbol,
  Symbol: Symbol,
  uuid: uuid,
  UUID: UUID,
  set: set,
  Set: Set,
  map: map,
  Map: Map,
  date: date,
  byteBuffer: byteBuffer,
  uri: uri,
  list: list,
  ints: ints,
  longs: longs,
  floats: floats,
  doubles: doubles,
  bools: bools,
  cmap: cmap,
  taggedValue: taggedValue,
  TaggedValue: TaggedValue
};
