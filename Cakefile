fs            = require 'fs'
{print}       = require 'sys'
{spawn, exec} = require 'child_process'

source_files = []

# Server files
source_files.push
  name   : 'Server files'
  prefix : 'server/'
  js     : undefined
  coffee : ['src/proxy.coffee', 'src/dispatcher.coffee']

# Client files
source_files.push
  name   : 'Client files'
  prefix : 'client/'
  js     : 'lib/p2pc.js'
  coffee : ['src/main.coffee', 'src/worker.coffee']

source_files = source_files.map (batch) ->
  name   : batch.name
  prefix : undefined
  js     : batch.prefix + batch.js if batch.js?
  coffee : batch.coffee.map (filename) -> batch.prefix + filename

compile = (batch) ->
  print "#{batch.name} : Compiling...\n"

  arguments = ['--compile']
  .concat(if batch.js? then ['--join', batch.js] else [])
  .concat(if batch.js? and batch.js.match('.js') then [] else '--bare')
  .concat(batch.coffee)

  coffee = spawn 'coffee', arguments
  coffee.stdout.on 'data', (data) -> print "#{batch.name} : " + data.toString()
  coffee.stderr.on 'data', (data) -> print "#{batch.name} : " + data.toString()
  coffee.on 'exit', (status) -> callback?() if status is 0

watch = (batch) ->
  for sourcefile in batch.coffee
    fs.watchFile sourcefile, -> compile batch

task 'build', 'Compile CoffeeScript source files', ->
  for batch in source_files
    compile batch

task 'watch', 'Recompile CoffeeScript source files when modified', ->
  for batch in source_files
    compile batch
    watch batch
