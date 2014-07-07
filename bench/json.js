#!/usr/bin/env node

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

process.stdin.setEncoding("utf8");

var fs      = require("fs"),
    fname   = process.argv[2] || "example",
    iter    = process.argv[3] ? parseInt(process.argv[3], 10) : 100,
    transit = require("../target/transit.js"),
    r       = transit.reader(),
    w       = transit.writer(),
    jstr    = fs.readFileSync("resources/"+fname+".json", "utf-8");
    tstr    = fs.readFileSync("resources/"+fname+".tjs", "utf-8");

function time(f, iters) {
    iters = iters || 1;
    for(var i = 0; i < iters; i++) {
        var s = new Date();
        f();
        console.log("Elapsed "+((new Date()).valueOf()-s.valueOf())+"ms");
        console.log("----------");
    }
}

console.log("JSON.parse "+iter+" iters");
time(function() {
    for(var i = 0; i < iter; i++) {
        JSON.parse(jstr);
    }
}, 5);

console.log("transit read "+iter+" iters");
time(function() {
    for(var i = 0; i < iter; i++) {
        r.read(tstr);
    }
}, 5);

console.log("JSON.stringify "+iter+" iters");
var dataJSON = JSON.parse(jstr);
time(function() {
    for(var i = 0; i < iter; i++) {
        JSON.stringify(dataJSON);
    }
}, 5);

console.log("transit.write "+iter+" iters");
var dataTransit = r.read(tstr);
time(function() {
    for(var i = 0; i < iter; i++) {
        w.write(dataTransit);
    }
}, 5);
