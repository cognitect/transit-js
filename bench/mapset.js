// Copyright 2014 Cognitect. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//require("es6-shim");
var transit = require("../target/transit.js");

function sum(a, b) { return a+b; };

function time(f, iters) {
    iters = iters || 1;
    var avg = [];
    for(var i = 0; i < iters; i++) {
        var s = new Date();
        f();
        var el = (new Date()).valueOf()-s.valueOf();
        if(iters == 1) {
            console.log("Elapsed "+el+"ms");
            console.log("----------");
        } else {
            avg.push(el);
        }
    }
    if(iters != 1) {
        console.log("Average Elapsed "+(avg.reduce(sum)/iters)+"ms");
        console.log("----------");
    }
}

console.log("Add 8 entries, 1000 iters, string key, es6-shim Map");
time(function() {
    for(var j = 0; j < 10000; j++) {
        var m = new Map();
        for(var i = 0; i < 4; i++) {
            m.set("foo"+i, i);
        }
    }
});

console.log("Add 8 entries, 1000 iters, string key, transit map");
time(function() {
    for(var j = 0; j < 10000; j++) {
        var m = transit.map();
        for(var i = 0; i < 4; i++) {
            m.set("foo"+i, i);
        }
    }
});


console.log("Add 1e4 entries, array key, es6-shim Map");
time(function() {
    var m = new Map();
    for(var i = 0; i < 10000; i++) {
        m.set(["foo"+i], i);
    }
});

console.log("Add 1e4 entries, array key, transit map");
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
    tm.set(ks[i], i);
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
        has = has && tm.has(ks[i]);
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
if(es6m.forEach) {
    time(function() {
        var s = 0;
        es6m.forEach(function(v, k) {
            s = s + v;
        });
        console.log(s);
    });
}

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
    smalltm.set(ks[i], i);
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
        has = has && smalltm.has(ks[i % 32]);
    }
    console.log(has);
});

var o4 = {
    "foo0": Math.round(Math.random()),
    "foo1": Math.round(Math.random()),
    "foo2": Math.round(Math.random()),
    "foo3": Math.round(Math.random())
};

var m4 = transit.map(
    ["foo0", Math.round(Math.random()),
     "foo1", Math.round(Math.random()),
     "foo2", Math.round(Math.random()),
     "foo3", Math.round(Math.random())]
);

console.log("4 entry object random access, 1000000 iters");
time(function() {
    var s = 0;
    for(var i = 0; i < 1000000; i++) {
        s += o4["foo"+(i % 4)];
    }
}, 10);

console.log("4 entry transit.map random access, 1000000 iters");
time(function() {
    var s = 0;
    for(var i = 0; i < 1000000; i++) {
        s += m4.get("foo"+(i % 4));
    }
}, 10);

var o8 = {
    "foo0": Math.round(Math.random()),
    "foo1": Math.round(Math.random()),
    "foo2": Math.round(Math.random()),
    "foo3": Math.round(Math.random()),
    "foo4": Math.round(Math.random()),
    "foo5": Math.round(Math.random()),
    "foo6": Math.round(Math.random()),
    "foo7": Math.round(Math.random())
};

var m8 = transit.map(
    ["foo0", Math.round(Math.random()),
     "foo1", Math.round(Math.random()),
     "foo2", Math.round(Math.random()),
     "foo3", Math.round(Math.random()),
     "foo4", Math.round(Math.random()),
     "foo5", Math.round(Math.random()),
     "foo6", Math.round(Math.random()),
     "foo7", Math.round(Math.random())]
);

console.log("8 entry object random access, 1000000 iters");
time(function() {
    var s = 0;
    for(var i = 0; i < 1000000; i++) {
        s += o8["foo"+(i % 8)];
    }
}, 10);

console.log("8 entry transit.map random access, 1000000 iters");
time(function() {
    var s = 0;
    for(var i = 0; i < 1000000; i++) {
        s += m8.get("foo"+(i % 8));
    }
}, 10);

var r16 = [];
for(var i = 0; i < 1000000; i++) {
    r16.push(Math.floor(Math.random()*16));
}

var o16 = {};
for(var i = 0 ; i < 16; i++) {
    o16["foo"+i] = Math.round(Math.random());
}

var arr16 = [];
for(var i = 0; i < 16; i++) {
    arr16.push("foo"+i, Math.round(Math.random()));
}
var m16 = transit.map(arr16, false, false);

console.log("16 entry object random access, 1000000 iters");
time(function() {
    var s = 0;
    for(var i = 0; i < 1000000; i++) {
        s += o16["foo"+r16[i]];
    }
}, 10);

console.log("16 entry transit array map random access, 1000000 iters");
time(function() {
    var s = 0;
    for(var i = 0; i < 1000000; i++) {
        s += m16.get("foo"+r16[i]);
    }
}, 10);

var r32 = [];
for(var i = 0; i < 1000000; i++) {
    r32.push(Math.floor(Math.random()*32));
}

var o32 = {};
for(var i = 0 ; i < 32; i++) {
    o32["foo"+i] = Math.round(Math.random());
}

var arr32 = [];
for(var i = 0; i < 32; i++) {
    arr32.push("foo"+i, Math.round(Math.random()));
}
var m32 = transit.map(arr32, false, false);

console.log("32 entry object random access, 1000000 iters");
time(function() {
    var s = 0;
    for(var i = 0; i < 1000000; i++) {
        s += o32["foo"+r32[i]];
    }
}, 10);

console.log("32 entry transit array map random access, 1000000 iters");
time(function() {
    var s = 0;
    for(var i = 0; i < 1000000; i++) {
        s += m32.get("foo"+r32[i]);
    }
},10);

var tm16 = transit.map();
for(var i = 0; i < 16; i++) {
    tm16.set("foo"+i, Math.round(Math.random()));
}

var tm32 = transit.map();
for(var i = 0; i < 32; i++) {
    tm32.set("foo"+i, Math.round(Math.random()));
}

console.log("16 entry transit hash map random access, 1000000 iters");
time(function() {
    var s = 0;
    for(var i = 0; i < 1000000; i++) {
        s += tm16.get("foo"+r16[i]);
    }
},10);

console.log("32 entry transit hash map random access, 1000000 iters");
time(function() {
    var s = 0;
    for(var i = 0; i < 1000000; i++) {
        s += tm32.get("foo"+r32[i]);
    }
},10);
