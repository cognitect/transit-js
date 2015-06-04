#!/usr/bin/env node --harmony
require("repl").start({useGlobal:true});

require("../deps/closure-library/closure/goog/bootstrap/nodejs.js");
require("../deps/closure-library/closure/goog/transit_deps.js");

goog.require("com.cognitect.transit");

global.transit = com.cognitect.transit;