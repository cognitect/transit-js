#!/usr/bin/env node

process.stdin.setEncoding("utf8");

var fs      = require("fs"),
    fname   = process.argv[2] || "example",
    transit = require("../target/transit.js"),
    r       = transit.reader(),
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

console.log("JSON.parse 100 iters");
time(function() {
    for(var i = 0; i < 100; i++) {
        JSON.parse(jstr);
    }
}, 5);

console.log("transit read 100 iters");
time(function() {
    for(var i = 0; i < 100; i++) {
        r.read(tstr);
    }
}, 5);
