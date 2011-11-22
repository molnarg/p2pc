(function() {
  var fs, http, inject_script, logger, modify_headers, modify_html, path, proxy, remove_index_redirects, repair_self_references, server, static_files, suppress_referer_for_links;

  http = require('http');

  proxy = require('http-proxy');

  fs = require('fs');

  path = require('path');

  inject_script = function(url) {
    return function(html) {
      return html.replace("</head>", "<script src=\"" + url + "\"></script>\n </head>");
    };
  };

  remove_index_redirects = function(html) {
    var encoded_link, encoded_links, match, x_redirect, _i, _len;
    x_redirect = new RegExp('"(http://index.hu)?/x[^"]*=', 'g');
    html = html.replace(x_redirect, '"');
    encoded_link = new RegExp('"[^"]*%2F[^"]*"', 'g');
    encoded_links = html.match(encoded_link);
    if (encoded_links != null) {
      for (_i = 0, _len = encoded_links.length; _i < _len; _i++) {
        match = encoded_links[_i];
        html = html.replace(match, decodeURIComponent(match));
      }
    }
    return html;
  };

  repair_self_references = function(url) {
    return function(html) {
      var references;
      references = new RegExp('="[^"]*' + url, 'g');
      return html.replace(references, '="/');
    };
  };

  suppress_referer_for_links = function(html) {
    return html.replace(/<a /g, '<a rel="noreferer" ');
  };

  modify_html = function(rewriters) {
    return function(req, res, next) {
      var html, new_end, new_write, original_end, original_write;
      original_write = res.write;
      original_end = res.end;
      html = '';
      new_write = function(data) {
        return html += data.toString();
      };
      new_end = function() {
        var rewriter, _i, _len;
        for (_i = 0, _len = rewriters.length; _i < _len; _i++) {
          rewriter = rewriters[_i];
          html = rewriter(html);
        }
        original_write.call(res, html);
        return original_end.call(res);
      };
      res.write = function(data) {
        var its_html;
        its_html = res._header.match(/Content-Type: text\/html/i);
        res.write = (its_html ? new_write : original_write);
        if (its_html) res.end = new_end;
        return res.write(data);
      };
      return next();
    };
  };

  static_files = function(files) {
    return function(req, res, next) {
      if (req.url in files) {
        return fs.readFile(files[req.url], function(err, content) {
          return res.end(content);
        });
      } else {
        return next();
      }
    };
  };

  modify_headers = function(new_headers) {
    return function(req, res, next) {
      var header;
      for (header in new_headers) {
        if (new_headers[header] != null) {
          req.headers[header] = new_headers[header];
        } else {
          delete req.headers[header];
        }
      }
      return next();
    };
  };

  logger = function() {
    var n;
    n = 0;
    return function(req, res, next) {
      console.log("" + (++n) + " - " + req.method + " " + req.url);
      return next();
    };
  };

  server = proxy.createServer('217.20.130.97', 80, logger(), static_files({
    '/p2pc.js': 'client/lib/p2pc.js',
    '/p2pc.html': 'client/test/p2pc.html',
    '/hook.js': path.resolve(require.resolve('hook.js'), '../../public/javascripts/hook.js')
  }), modify_headers({
    host: 'index.hu',
    referer: void 0,
    cookie: void 0
  }), modify_html([inject_script('/p2pc.js'), remove_index_redirects, repair_self_references('http://index.hu/'), suppress_referer_for_links]));

  server.listen(8080);

}).call(this);
