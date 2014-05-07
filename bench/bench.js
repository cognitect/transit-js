var t = require("../src/transit/types.js");

function time(f) {
  var s = new Date();
  f();
  console.log("Elapsed "+((new Date()).valueOf()-s.valueOf())+"ms");
}

var Map = t.Map;

var m0 = new Map([["foo", "map string lookup"]]);
time(function() {
  for(var i = 0; i < 100000; i++) {
    m0.get("foo");
  }
});

var tm0 = t.transitMap(["foo", "transit map string lookup"]);
console.log(tm0.get("foo"));
time(function() {
  for(var i = 0; i < 100000; i++) {
    tm0.get("foo");
  }
});

var tm1 = t.transitMap([[1,2], "transit map array lookup"]);
console.log(tm1.get([1,2]));
time(function() {
  var key = [1,2];
  for(var i = 0; i < 100000; i++) {
    tm1.get(key);
  }
});
