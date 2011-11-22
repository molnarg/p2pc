(function() {
  var hookjs_test, main, worker;

  main = function() {
    var worker;
    window.onload = hookjs_test;
    return;
    console.log('main');
    worker = new SharedWorker("/p2pc.js");
    worker.onerror = function(e) {
      throw new Error(e.message + " (" + e.filename + ":" + e.lineno + ")");
    };
    worker.port.onmessage = function(e) {
      return console.log(e.data);
    };
    return worker.port.start();
  };

  hookjs_test = function() {
    var Hook, chat, checkSubmit, input, messages, name, submitMessage;
    chat = document.createElement('div');
    chat.setAttribute('style', 'position: fixed;\nright: 2em;\ntop: 1em;\nbottom: 1em;\n\nwidth: 20em;\nmargin-bottom: 2em;\n\nbackground-color: rgba(0,0,0,0.1);\ncolor: black;');
    document.body.appendChild(chat);
    messages = document.createElement('div');
    messages.setAttribute('style', 'position: relative;\nheight: 100%;\n-bottom: 2em;\noverflow-y: scroll;');
    chat.appendChild(messages);
    input = document.createElement('input');
    input.setAttribute('style', 'font-size: 1.2em;\n\nposition: absolute;\nleft: 0;\nright: 0;\nbottom: -2em;\n\nheight: 1.5em;\nmargin: 0;\npadding: 0;\n\nbackground-color: rgba(255,255,255,0.2);');
    chat.appendChild(input);
    Hook = window.require('/hook.js').Hook;
    window.hook = new Hook();
    window.hook.connect();
    name = 'browser-' + Math.floor(Math.random() * 100);
    setTimeout((function() {
      return hook.emit(name + '::name', name);
    }), 500);
    window.hook.on('*::message', function(message) {
      var node;
      node = document.createTextNode("" + message.from + " - " + message.content);
      messages.appendChild(node);
      return messages.appendChild(document.createElement('br'));
    });
    window.hook.on('*::name', function(message) {
      var message_node;
      message_node = document.createTextNode(message + ' opened the page.');
      messages.appendChild(message_node);
      return messages.appendChild(document.createElement('br'));
    });
    submitMessage = function(message) {
      return hook.emit(name + '::message', {
        from: name,
        content: message
      });
    };
    checkSubmit = function(e) {
      if (e.keyCode === 13) {
        submitMessage(input.value);
        return input.value = '';
      }
    };
    return input.addEventListener('keydown', checkSubmit, false);
  };

  worker = function() {
    var portlist;
    portlist = [];
    setInterval((function() {
      var port, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = portlist.length; _i < _len; _i++) {
        port = portlist[_i];
        _results.push(port.postMessage("#connections = " + portlist.length));
      }
      return _results;
    }), 1000);
    return self.onconnect = function(event) {
      return portlist.push(event.ports[0]);
    };
  };

  if (typeof document === 'undefined') {
    worker();
  } else {
    main();
  }

}).call(this);
