worker = ->
  portlist = []

  setInterval ( ->
    for port in portlist
      port.postMessage "#connections = " + portlist.length
  ), 1000

  self.onconnect = (event) ->
    portlist.push event.ports[0]
