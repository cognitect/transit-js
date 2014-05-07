"use strict";

var eq = require("../src/transit/eq.js"),
    t  = require("../src/transit/types.js");

function time(f) {
  for(var i = 0; i < 10; i++) {
    var s = new Date();
    f();
    console.log("Elapsed "+((new Date()).valueOf()-s.valueOf())+"ms");
  }
}

console.log("1e6 iters, eq.equals(\"foo\", \"foo\")");
time(function() {
  for(var i = 0; i < 1000000; i++) {
    eq.equals("foo", "foo");
  }
});

console.log("1e6 iters, eq.equals(\"foo\", \"bar\")");
time(function() {
  for(var i = 0; i < 1000000; i++) {
    eq.equals("foo", "bar");
  }
});

console.log("1e6 iters, TransitMap tm0.get(\"foo\")");
var tm0 = t.transitMap(["foo", "transit map string lookup"]);
console.log(tm0.get("foo"));
time(function() {
  for(var i = 0; i < 1000000; i++) {
    tm0.get("foo");
  }
});

console.log("1e5 iters, TransitMap tm0.get([1,2])");
var tm1 = t.transitMap([[1,2], "transit map array lookup"]);
console.log(tm1.get([1,2]));
time(function() {
  var key = [1,2];
  for(var i = 0; i < 100000; i++) {
    tm1.get(key);
  }
});
