#!/usr/bin/env node

var fs      = require("fs"),
    fname   = process.argv[2] || "example",
    json    = fs.readFileSync("resources/"+fname+".json", "utf-8"),
    transit = require("../target/transit.js"),
    r       = transit.reader("json"),
    w       = transit.writer("json");

fs.writeFileSync("resources/"+fname+".tjs", w.write(r.read(json)));
