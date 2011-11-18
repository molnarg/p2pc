fs            = require 'fs'
{print}       = require 'sys'
{spawn, exec} = require 'child_process'

javascripts =
  'bin/worker.js' : ['src/worker.coffee']
  'bin/p2pc.js'   : ['src/p2pc.coffee']

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
  for js of javascripts
    compile js, javascripts[js]

task 'watch', 'Recompile CoffeeScript source files when modified', ->
  for js of javascripts
    compile js, javascripts[js]
    watch js, javascripts[js]
