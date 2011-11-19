(function() {
  var http, middleware, proxy, server;

  http = require('http');

  proxy = require('http-proxy');

  middleware = function(req, res, next) {
    var new_write, original_write;
    original_write = res.write;
    new_write = function(data) {
      var scripttag, towrite;
      scripttag = '<script>alert(42);</script>\n';
      towrite = data.toString().replace('</head>', scripttag + '</head>');
      return original_write.call(res, towrite);
    };
    res.write = function(data) {
      var its_html;
      its_html = res._header.match(/Content-Type: text\/html/i);
      res.write = (its_html ? new_write : original_write);
      return res.write(data);
    };
    return next();
  };

  server = proxy.createServer(middleware, 80, '217.20.130.97');

  server.listen(80);

}).call(this);
