http = require 'http'
proxy = require 'http-proxy'
fs = require 'fs'

inject_script = (url) -> (html) ->
  html.replace("</head>", "<script src=\"#{url}\"></script>\n </head>")

remove_index_redirects = (html) ->
  x_redirect = new RegExp('"(http://index.hu)?/x[^"]*=', 'g')
  html = html.replace(x_redirect, '"')

  encoded_link = new RegExp('"[^"]*%2F[^"]*"', 'g')
  encoded_links = html.match(encoded_link)
  if encoded_links? then for match in encoded_links
    html = html.replace(match, decodeURIComponent(match))

  return html

repair_self_references = (url) -> (html) ->
  references = new RegExp('="[^"]*' + url, 'g')
  html.replace(references, '="/')

suppress_referer_for_links = (html) ->
  html.replace(/<a /g,      '<a rel="noreferer" ')

# See https://github.com/nodejitsu/node-http-proxy/
#     blob/master/examples/middleware/modifyResponse-middleware.js
modify_html = (rewriters) -> (req, res, next) ->
  original_write = res.write
  original_end = res.end

  html = ''

  new_write = (data) -> html += data.toString()

  new_end = ->
    for rewriter in rewriters
      html = rewriter html

    original_write.call res, html
    original_end.call res

  res.write = (data) ->
    its_html = res._header.match /Content-Type: text\/html/i
    res.write = (if its_html then new_write else original_write)
    res.end = new_end if its_html

    res.write data

  next()

# Middleware to serve static file
serve_static_file = (url, file) -> (req, res, next) ->
  if req.url == url
    fs.readFile file, (err, content) ->
      res.end content
  else
    next()

# Middleware to rewrite headers
modify_headers = (new_headers) -> (req, res, next) ->
  for header of new_headers
    if new_headers[header]?
      req.headers[header] = new_headers[header]
    else
      delete req.headers[header]

  console.log req.headers

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
  serve_static_file('/p2pc.js', 'client/lib/p2pc.js'),
  modify_headers(
    host    : 'index.hu'
    referer : undefined
    cookie  : undefined
  ),
  modify_html([
    inject_script('/p2pc.js')
    remove_index_redirects
    repair_self_references('http://index.hu/')
    suppress_referer_for_links
  ])


server.listen 8080
