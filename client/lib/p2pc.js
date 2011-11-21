(function() {
  var main, worker;

  main = function() {
    var worker;
    console.log('main');
    worker = new SharedWorker("/p2pc.js");
    worker.onerror = function(e) {
      throw new Error(e.message + " (" + e.filename + ":" + e.lineno + ")");
    };
    worker.port.onmessage = function(e) {
      return console.log(e.data);
    };
    return worker.port.start();
  };

  worker = function() {
    var portlist;
    portlist = [];
    setInterval((function() {
      var port, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = portlist.length; _i < _len; _i++) {
        port = portlist[_i];
        _results.push(port.postMessage("#connections = " + portlist.length));
      }
      return _results;
    }), 1000);
    return self.onconnect = function(event) {
      return portlist.push(event.ports[0]);
    };
  };

  if (typeof document === 'undefined') {
    worker();
  } else {
    main();
  }

}).call(this);
