fs            = require 'fs'
{print}       = require 'sys'
{spawn, exec} = require 'child_process'


javascript_files = {}

# Server files
javascript_files['server/bin/p2pc_server.js'] = [
  'server/src/proxy.coffee'
  'server/src/dispatcher.coffee'
]

# Client files
javascript_files['client/lib/p2pc.js'] = [
  'client/src/main.coffee'
  'client/src/worker.coffee'
]


compile = (js, sourcefiles) ->
  print "#{js} : Compiling...\n"

  arguments = [
    '--compile'
    '--join', js
  ].concat sourcefiles

  coffee = spawn 'coffee', arguments
  coffee.stdout.on 'data', (data) -> print "#{js} : " + data.toString()
  coffee.stderr.on 'data', (data) -> print "#{js} : " + data.toString()
  coffee.on 'exit', (status) -> callback?() if status is 0

watch = (js, sourcefiles) ->
  for sourcefile in sourcefiles
    fs.watchFile sourcefile, -> compile js, sourcefiles

task 'build', 'Compile CoffeeScript source files', ->
  for js of javascript_files
    compile js, javascript_files[js]

task 'watch', 'Recompile CoffeeScript source files when modified', ->
  for js of javascript_files
    compile js, javascript_files[js]
    watch js, javascript_files[js]
