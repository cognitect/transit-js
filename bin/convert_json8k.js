#!/usr/bin/env node

var fs      = require("fs"),
    json    = fs.readFileSync("resources/example.json", "utf-8"),
    transit = require("../target/transit.js"),
    r       = transit.reader("json"),
    w       = transit.writer("json");

fs.writeFileSync("resources/example.tjs", w.write(r.read(json)));
