http    = require 'http'
proxy   = require 'http-proxy'
fs      = require 'fs'
path    = require 'path'
connect = require 'connect'

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

rewrite_img_src = (html) ->
  return html if not this.cookies.rewrite

  for old_url, new_url of JSON.parse(this.cookies.rewrite)
    html = html.replace("src=\"#{old_url}\"", "src=\"#{new_url}\"")

  return html

# See https://github.com/nodejitsu/node-http-proxy/
#     blob/master/examples/middleware/modifyResponse-middleware.js
modify_html = (rewriters) -> (req, res, next) ->
  original_write = res.write
  original_end = res.end

  html = ''

  new_write = (data) -> html += data.toString()

  new_end = ->
    for rewriter in rewriters
      html = rewriter.call req, html

    original_write.call res, html
    original_end.call res

  res.write = (data) ->
    its_html = res._header.match /Content-Type: text\/html/i
    res.write = (if its_html then new_write else original_write)
    res.end = new_end if its_html

    res.write data

  next()

# Middleware to serve static file
static_files = (files) -> (req, res, next) ->
  if req.url of files
    fs.readFile files[req.url], (err, content) ->
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
  connect.cookieParser(),
  static_files(
    '/p2pc.js'   : 'client/lib/p2pc.js'
    '/p2pc.html' : 'client/test/p2pc.html'
    '/hook.js'   : path.resolve(require.resolve('hook.js'), '../../public/javascripts/hook.js')
  ),
  modify_headers(
    host    : 'index.hu'
    referer : undefined
    cookie  : undefined
  ),
  modify_html([
    inject_script('/p2pc.js')
    inject_script('/hook.js')
    remove_index_redirects
    repair_self_references('http://index.hu/')
    suppress_referer_for_links
    rewrite_img_src
  ])

server.listen 8080
