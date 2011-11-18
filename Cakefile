fs            = require 'fs'
{print}       = require 'sys'
{spawn, exec} = require 'child_process'

javascripts =
  'worker.js' : ['worker.coffee']
  'p2pc.js'   : ['p2pc.coffee']

compile = (js, sourcefiles) ->
  print "#{js} : Compiling...\n"

  options = ['--compile'
             '--output', 'bin'
             '--join', js]
  options = options.concat(sourcefiles.map (file) -> 'src/' + file)

  coffee = spawn 'coffee', options
  coffee.stdout.on 'data', (data) -> print "#{js} : " + data.toString()
  coffee.stderr.on 'data', (data) -> print "#{js} : " + data.toString()
  coffee.on 'exit', (status) -> callback?() if status is 0

watch = (js, sourcefiles) ->
  sourcefiles.map (sourcefile) ->
    fs.watchFile 'src/' + sourcefile, -> compile js, sourcefiles

task 'build', 'Compile CoffeeScript source files', ->
  for js of javascripts
    compile js, javascripts[js]

task 'watch', 'Recompile CoffeeScript source files when modified', ->
  for js of javascripts
    compile js, javascripts[js]
    watch js, javascripts[js]
