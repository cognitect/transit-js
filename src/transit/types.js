"use strict";

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
  return parseInt(s, 10);
}

function floatValue(s) {
  return parseFloat(s);
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

function URI(s) {
}

function uri(s) {
  return new URI(s);
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

module.exports = {
  nullValue: nullValue,
  boolValue: boolValue,
  intValue: intValue,
  floatValue: floatValue,
  symbol: symbol,
  uuid: uuid,
  set: set,
  map: map,
  date: date,
  byteBuffer: byteBuffer,
  uri: uri,
  list: list,
  ints: ints,
  longs: longs,
  floats: floats,
  doubles: doubles,
  bools: bools,
  cmap: cmap
};
