#!/usr/bin/env node

var fs      = require("fs"),
    json    = fs.readFileSync("../transit/seattle-data0.tjs", "utf-8"),
    transit = require("../target/transit.js"),
    r       = transit.reader("json"),
    w       = transit.writer("json");

fs.writeFileSync("../transit/seattle-data0.json", JSON.stringify(r.read(json)));
