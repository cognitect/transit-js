if(typeof Set == "undefined") {
  var Set = require("es6-set");
}

if(typeof Map == "undefined") {
  var Map = require("es6-map");
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

function date(s) {
  return new Date(s);
}

function byteBuffer(data) {
  return new ByteBuffer(data);
}

function URI() {
}

function uri(s) {
  return new URI(s);
}

module.exports = {
  symbol: symbol
  uuid: uuid,
  set: set,
  map: map,
  date: date,
  byteBuffer: byteBuffer,
  uri: uri
};
