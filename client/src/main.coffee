main = ->
  console.log 'main'

  worker = new Worker "/p2pc.js"

  worker.onerror = (e) ->
    throw new Error(e.message + " (" + e.filename + ":" + e.lineno + ")")

  worker.port.onmessage = (e) ->
    console.log e.data

  worker.port.start()
