http = require 'http'
proxy = require 'http-proxy'

# See https://github.com/nodejitsu/node-http-proxy/
#     blob/master/examples/middleware/modifyResponse-middleware.js
middleware = (req, res, next) ->
  if req.url is '/'
    original_write = res.write

    res.write = (data) ->
      scripttag = '<script>alert(42);</script>'
      towrite = data.toString().replace '</head>', scripttag + '</head>'
      original_write.call res, towrite

  next()

server = proxy.createServer middleware, 80, '217.20.130.97'

server.listen 80
