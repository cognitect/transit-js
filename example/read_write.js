#!/usr/bin/env node

process.stdin.setEncoding("utf8");

var transit   = require("../src/transit.js"),
    transport = process.argv[0] || "json",
    r         = transit.reader(transport),
    w         = transit.writer();

process.stdin.on("data", function(data, err) {
    process.stdout.write(transit.write(transit.read(data)));
});
