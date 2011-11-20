worker = ->
  console.log 'worker'

  portlist = []

  setInterval ( ->
    for port in portlist
      port.postMessage "#connections = " + list.length
  ), 1000

  self.onconnect = (event) ->
    portlist.push event.ports[0]
