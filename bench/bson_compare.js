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

var bson    = require("bson"),
    BSON    = bson.BSONPure.BSON,
    Long    = bson.Long,
    transit = require("../target/transit.js"),
    w       = transit.writer();

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

var doc = {long: Long.fromNumber(100)}

console.log("BSON serialize Object 1KV with long", BSON.serialize(doc, false, true, false));
time(function() {
    for(var i = 0; i < 100000; i++) {
        BSON.serialize(doc, false, true, false);
    }
});

var tjs = transit.map(["long", transit.integer("100")]);
console.log("transist.write map 1KV with long", w.write(tjs));
time(function() {
    for(var i = 0; i < 100000; i++) {
        w.write(tjs);
    }
});

