var writeCache = require("writeCache");

var JSON_INT_MAX = Math.pow(2, 53);
var JSON_INT_MIN = -JSON_INT_MAX;

function emitInts(em, src, cache) {
}

function emitShorts(em, src, cache) {
}

function emitShorts(em, src, cache) {
}

function emitLongs(em, src, cache) {
}

function emitFloats(em, src, cache) {
}

function emitDouble(em, src, cache) {
}

function emitChars(em, src, cache) {
}

function emitBooleans(em, src, cache) {
}

function emitObjects(em, src, cache) {
}

function emitArray(em, iterable, skip, cache) {
}

function emitMap(em, iterable, skip, cache) {
}

function AsTag(tag, rep, str) {
  this.tag = tag;
  this.rep = rep;
  this.str = str;
}

function Quote(obj) {
  this.obj = obj;
}

function TaggedValue(tag, rep) {
  this.tag = tag;
  this.rep = rep;
}

function hasStringableKeys(m) {
}

function emitTaggedMap(em, tag, rep, skip, cache) {
}

function emitEncoded(em, h, tag, obj, asMapKey, cache) {
}

function marshal() {
}

function maybeQuoted(obj) {
}

function marshalTop() {
}

function getItfHandler(ty) {
}

function getBaseHandler(ty) {
}

function handler(obj) {
}

function write(writer, obj) {
  marshalTop(m, writer, obj, writeCache());
}

