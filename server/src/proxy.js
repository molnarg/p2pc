(function() {
  var fs, http, inject_script, proxy, rewrite_virtual_host, serve_static_file, server;

  http = require('http');

  proxy = require('http-proxy');

  fs = require('fs');

  inject_script = function(url) {
    return function(req, res, next) {
      var new_write, original_write;
      original_write = res.write;
      new_write = function(data) {
        var scripttag, towrite;
        scripttag = "<script src=\"" + url + "\"></script>\n";
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
  };

  serve_static_file = function(url, file) {
    return function(req, res, next) {
      if (req.url === url) {
        return fs.readFile(file, function(err, content) {
          return res.end(content);
        });
      } else {
        return next();
      }
    };
  };

  rewrite_virtual_host = function(new_vh) {
    return function(req, res, next) {
      req.headers.host = new_vh;
      return next();
    };
  };

  server = proxy.createServer('217.20.130.97', 80, inject_script('/p2pc.js'), serve_static_file('/p2pc.js', '../../client/lib/p2pc.js'), rewrite_virtual_host('index.hu'));

  server.listen(8080);

}).call(this);
