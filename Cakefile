fs            = require 'fs'
{print}       = require 'sys'
{spawn, exec} = require 'child_process'

source_files = []

# Server files
source_files.push
  name   : 'Server files'
  prefix : 'server/'
  coffee : ['src/proxy', 'src/dispatcher']

# Client files
source_files.push
  name   : 'Client files'
  prefix : 'client/'
  join   : 'lib/p2pc.js'
  coffee : ['src/main', 'src/worker', 'src/check_environment']

source_files = source_files.map (batch) ->
  name   : batch.name
  bare   : batch.bare
  join   : batch.prefix + batch.join if batch.join?
  coffee : batch.coffee.map (filename) -> batch.prefix + filename + '.coffee'

compile = (batch) ->
  print "#{batch.name} : Compiling...\n"

  arguments = ['--compile']
  .concat(if batch.join? then ['--join', batch.join] else [])
  .concat(if batch.bare? then ['--bare'] else [])
  .concat(batch.coffee)

  coffee = spawn 'coffee', arguments
  coffee.stdout.on 'data', (data) -> print data.toString()
  coffee.stderr.on 'data', (data) -> print data.toString()
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
