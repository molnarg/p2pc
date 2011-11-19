http = require 'http'
proxy = require 'http-proxy'

# See https://github.com/nodejitsu/node-http-proxy/
#     blob/master/examples/middleware/modifyResponse-middleware.js
middleware = (req, res, next) ->
  original_write = res.write

  new_write = (data) ->
    scripttag = '<script>alert(42);</script>\n'
    towrite = data.toString().replace '</head>', scripttag + '</head>'
    original_write.call res, towrite

  res.write = (data) ->
    its_html = res._header.match /Content-Type: text\/html/i
    res.write = (if its_html then new_write else original_write)
    res.write data

  next()

server = proxy.createServer middleware, 80, '217.20.130.97'

server.listen 80
