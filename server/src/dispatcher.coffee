HookJsServer = require('hook.js').Core

server = new HookJsServer
  name : 'hookjs-server'
  port : 9000

server.start()
