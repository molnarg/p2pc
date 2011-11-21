http = require 'http'
proxy = require 'http-proxy'
fs = require 'fs'

inject_script = (url) -> (html) ->
  html.replace("</head>", "<script src=\"#{url}\"></script>\n </head>")

# See https://github.com/nodejitsu/node-http-proxy/
#     blob/master/examples/middleware/modifyResponse-middleware.js
modify_html = (rewriters) -> (req, res, next) ->
  original_write = res.write

  new_write = (data) ->
    data = data.toString()

    for rewriter in rewriters
      data = rewriter data

    original_write.call res, data

  res.write = (data) ->
    its_html = res._header.match /Content-Type: text\/html/i
    res.write = (if its_html then new_write else original_write)
    res.write data

  next()

# Middleware to serve static file
serve_static_file = (url, file) -> (req, res, next) ->
  if req.url == url
    fs.readFile file, (err, content) ->
      res.end content
  else
    next()

#Middleware to rewrite host url (to be able to run the proxy on arbitrary address)
rewrite_virtual_host = (new_vh) -> (req, res, next) ->
  req.headers.host = new_vh

  next()

# Utility to log the requests forwarded by the proxy
logger = ->
  n = 0
  (req, res, next) ->
    console.log "#{++n} - #{req.method} #{req.url}"

    next()

server = proxy.createServer \
  '217.20.130.97', 80,
  logger(),
  modify_html([inject_script('/p2pc.js')]),
  serve_static_file('/p2pc.js', 'client/lib/p2pc.js'),
  rewrite_virtual_host('index.hu')


server.listen 8080
