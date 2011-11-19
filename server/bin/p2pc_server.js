(function() {
  var http, middleware, proxy, server;

  http = require('http');

  proxy = require('http-proxy');

  middleware = function(req, res, next) {
    var original_write;
    if (req.url === '/') {
      original_write = res.write;
      res.write = function(data) {
        var scripttag, towrite;
        scripttag = '<script>alert(42);</script>';
        towrite = data.toString().replace('</head>', scripttag + '</head>');
        return original_write.call(res, towrite);
      };
    }
    return next();
  };

  server = proxy.createServer(middleware, 80, '217.20.130.97');

  server.listen(80);

}).call(this);
