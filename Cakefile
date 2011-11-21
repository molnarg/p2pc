fs            = require 'fs'
{print}       = require 'sys'
{spawn, exec} = require 'child_process'

source_files = []

# Server files
source_files.push
  name   : 'Server files'
  prefix : 'server/'
  coffee : ['src/proxy', 'src/dispatcher']
  run    : 'bin/p2pc_server'

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
  run    : batch.prefix + batch.run if batch.run?

compile = (batch, callback) ->
  print "#{batch.name} : Compiling...\n"

  arguments = ['--compile']
  .concat(if batch.join? then ['--join', batch.join] else [])
  .concat(if batch.bare? then ['--bare'] else [])
  .concat(batch.coffee)

  coffee = spawn 'coffee', arguments
  coffee.stdout.on 'data', (data) -> print data.toString()
  coffee.stderr.on 'data', (data) -> print data.toString()
  coffee.on 'exit', (status) -> callback?(batch) if status is 0

watch = (batch, callback) ->
  onFileChange = (file, callback) ->
    fs.watchFile file, (curr, prev) ->
      if curr.mtime.getTime() != prev.mtime.getTime()
        callback()

  for sourcefile in batch.coffee
    onFileChange sourcefile, -> compile(batch, callback)

run = (batch) ->
  return if not batch.run?

  console.log "#{batch.name} : Running #{batch.run}"

  # Kill running instance first if any
  if batch.process?
    batch.process.kill()

  # Run a new instance
  batch.process = spawn batch.run
  batch.process.stdout.on 'data', (data) -> print data.toString()
  batch.process.stderr.on 'data', (data) -> print data.toString()

task 'build', 'Compile CoffeeScript source files', ->
  for batch in source_files
    compile batch

task 'watch', 'Recompile CoffeeScript source files when modified', ->
  for batch in source_files
    compile batch
    watch batch

task 'watch_and_run', 'Recompile CoffeeScript source files when modified, and run batches which have an executable specified.', ->
  for batch in source_files
    compile batch
    run batch
    watch batch, run
