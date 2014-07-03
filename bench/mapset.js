require("es6-shim");
var transit = require("../target/transit.js");

function time(f, iters) {
    iters = iters || 1;
    for(var i = 0; i < iters; i++) {
        var s = new Date();
        f();
        console.log("Elapsed "+((new Date()).valueOf()-s.valueOf())+"ms");
        console.log("----------");
    }
}

console.log("Add 1e4 entries es6-shim Map");
time(function() {
    var m = new Map();
    for(var i = 0; i < 10000; i++) {
        m.set(["foo"+i], i);
    }
});

console.log("Add 1e4 entries, transit map");
time(function() {
    var m = transit.map();
    for(var i = 0; i < 10000; i++) {
        m.set(["foo"+i], i);
    }
});

var es6m = new Map(),
    ks   = [];
for(var i = 0; i < 10000; i++) {
    var k = ["foo"+i];
    es6m.set(k, i);
    ks.push(k);
}

var tm = transit.map();
for(var i = 0; i < 10000; i++) {
    tm.set(["foo"+i], i);
}

console.log("has 1e4 entries es6-shim Map");
time(function() {
    var has = true;
    for(var i = 0; i < 10000; i++) {
        has = has && es6m.has(ks[i]);
    }
    console.log(has);
});

console.log("has 1e4 entries transit map");
time(function() {
    var has = true;
    for(var i = 0; i < 10000; i++) {
        has = has && tm.has(["foo"+i]);
    }
    console.log(has);
});

es6m = new Map();
for(var i = 0; i < 1000000; i++) {
    es6m.set(i, i);
}

tm = transit.map();
for(var i = 0; i < 1000000; i++) {
    tm.set(i, i);
}

console.log("forEach 1e6 entries es6-shim Map");
time(function() {
    var s = 0;
    es6m.forEach(function(v, k) {
        s = s + v;
    });
    console.log(s);
});

console.log("forEach 1e6 entries transit map");
time(function() {
    var s = 0;
    tm.forEach(function(v, k) {
        s = s + v;
    });
    console.log(s);
});

var smalles6m = new Map(),
    ks   = [];
for(var i = 0; i < 32; i++) {
    var k = ["foo"+i];
    smalles6m.set(k, i);
    ks.push(k);
}

var smalltm = transit.map();
for(var i = 0; i < 32; i++) {
    smalltm.set(["foo"+i], i);
}

console.log("has 32 entries es6-shim Map, 1000000 iters");
time(function() {
    var has = true;
    for(var i = 0; i < 1000000; i++) {
        has = has && smalles6m.has(ks[i % 32]);
    }
    console.log(has);
});

console.log("has 32 entries transit map, 1000000 iters");
time(function() {
    var has = true;
    for(var i = 0; i < 1000000; i++) {
        has = has && smalltm.has(["foo"+(i % 32)]);
    }
    console.log(has);
});
