main = ->
  window.onload = hookjs_test
  return

  console.log 'main'

  worker = new SharedWorker "/p2pc.js"

  worker.onerror = (e) ->
    throw new Error(e.message + " (" + e.filename + ":" + e.lineno + ")")

  worker.port.onmessage = (e) ->
    console.log e.data

  worker.port.start()

hookjs_test = ->
  chat = document.createElement 'div'
  chat.setAttribute 'style', '''
    position: fixed;
    right: 2em;
    top: 1em;
    bottom: 1em;

    width: 20em;
    margin-bottom: 2em;

    background-color: rgba(0,0,0,0.1);
    color: black;
  '''
  document.body.appendChild chat

  messages = document.createElement 'div'
  messages.setAttribute 'style', '''
    position: relative;
    height: 100%;
    -bottom: 2em;
    overflow-y: scroll;
  '''
  chat.appendChild messages

  input = document.createElement 'input'
  input.setAttribute 'style', '''
    font-size: 1.2em;

    position: absolute;
    left: 0;
    right: 0;
    bottom: -2em;

    height: 1.5em;
    margin: 0;
    padding: 0;

    background-color: rgba(255,255,255,0.2);
  '''
  chat.appendChild input

  Hook = window.require('/hook.js').Hook
  window.hook = new Hook()
  window.hook.connect()

  name = 'browser-' + Math.floor(Math.random()*100)
  setTimeout (-> hook.emit name + '::name', name), 500

  window.hook.on '*::message', (message) ->
    node = document.createTextNode("#{message.from} - #{message.content}")
    messages.appendChild node
    messages.appendChild document.createElement 'br'

  window.hook.on '*::name', (message) ->
    message_node = document.createTextNode(message + ' opened the page.')
    messages.appendChild message_node
    messages.appendChild document.createElement 'br'

  submitMessage = (message) ->
    hook.emit name + '::message',
      from : name
      content : message

  checkSubmit = (e) ->
    if e.keyCode is 13
      submitMessage(input.value)
      input.value = ''

  input.addEventListener('keydown', checkSubmit, false);
