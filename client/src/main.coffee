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
    position: absolute;
    left: 0;
    right: 0;
    top: -0.6em;
    bottom: 0.5em;
    padding: 1.2em;

    font-family: Courier New;

    background-color: rgba(255,255,255,0.92);
    -webkit-box-shadow:rgba(0, 0, 0, 0.38) 0px 0px 32px -1px;
    border-radius: 15px;
    color: black;
  '''
  $('content').makePositioned()
  $('content').appendChild chat
  $('ilogo').onclick = ->
    chat.toggle()
    return false

  messages = document.createElement 'div'
  messages.setAttribute 'style', '''
    position: relative;
    font-size: 21px;
    line-height: 28px;
  '''
  chat.appendChild messages

  input = document.createElement 'input'
  input.setAttribute 'style', '''
    font-size: 21px;
    font-family: Courier New;

    width: 100%;
    height: 1.5em;
    margin: 0;
    padding: 0;

    background-color: rgba(255,255,255,0.2);
  '''
  chat.appendChild input

  window.hook = new Hook()

  name = 'browser-' + Math.floor(Math.random()*100)
  random = ->
    if Math.random() > 0.5
      Math.floor(128*Math.random())
    else
      128 + Math.floor(128*Math.random())
  ownColor = {r:random(), g:random(), b:random()}
  setTimeout (-> hook.emit name + '::name', ownColor), 500

  addMessage = (color, text) ->
    {r,g,b} = color
    message_node = document.createElement 'div'
    message_node.appendChild document.createTextNode(text)
    message_node.setAttribute 'style', "color: rgba(#{r}, #{g}, #{b}, 1);"
    messages.appendChild message_node

  window.hook.on '*::message', (m) -> addMessage(m.from, m.content)
  window.hook.on '*::name', (m) -> addMessage(m, 'Új böngésző')

  submitMessage = (message) ->
    hook.emit name + '::message',
      from : ownColor
      content : message

  checkSubmit = (e) ->
    if e.keyCode is 13
      submitMessage(input.value)
      input.value = ''

  input.addEventListener('keydown', checkSubmit, false);
