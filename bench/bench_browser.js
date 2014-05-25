var seattle = document.getElementById("seattle").textContent,
    r = transit.reader("json");

function time(f, iters) {
    iters = iters || 1;
    for(var i = 0; i < iters; i++) {
        var s = new Date();
        f();
        console.log("Elapsed "+((new Date()).valueOf()-s.valueOf())+"ms");
        console.log("----------");
    }
}

time(function() {
    for(var i = 0; i < 100; i++) {
        r.read(seattle);
    }
});

