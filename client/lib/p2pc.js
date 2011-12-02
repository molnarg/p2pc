(function() {
  var FileSystem, hookjs_test, main, worker;

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
    var addMessage, chat, checkSubmit, input, messages, name, ownColor, random, submitMessage;
    chat = document.createElement('div');
    chat.setAttribute('style', 'position: absolute;\nleft: 0;\nright: 0;\ntop: -0.6em;\nbottom: 0.5em;\npadding: 1.2em;\n\nfont-family: Courier New;\n\nbackground-color: rgba(255,255,255,0.92);\n-webkit-box-shadow:rgba(0, 0, 0, 0.38) 0px 0px 32px -1px;\nborder-radius: 15px;\ncolor: black;');
    $('content').makePositioned();
    $('content').appendChild(chat);
    $('ilogo').onclick = function() {
      chat.toggle();
      return false;
    };
    messages = document.createElement('div');
    messages.setAttribute('style', 'position: relative;\nfont-size: 21px;\nline-height: 28px;');
    chat.appendChild(messages);
    input = document.createElement('input');
    input.setAttribute('style', 'font-size: 21px;\nfont-family: Courier New;\n\nwidth: 100%;\nheight: 1.5em;\nmargin: 0;\npadding: 0;\n\nbackground-color: rgba(255,255,255,0.2);');
    chat.appendChild(input);
    window.hook = new Hook();
    name = 'browser-' + Math.floor(Math.random() * 100);
    random = function() {
      if (Math.random() > 0.5) {
        return Math.floor(128 * Math.random());
      } else {
        return 128 + Math.floor(128 * Math.random());
      }
    };
    ownColor = {
      r: random(),
      g: random(),
      b: random()
    };
    setTimeout((function() {
      return hook.emit(name + '::name', ownColor);
    }), 500);
    addMessage = function(color, text) {
      var b, g, message_node, r;
      r = color.r, g = color.g, b = color.b;
      message_node = document.createElement('div');
      message_node.appendChild(document.createTextNode(text));
      message_node.setAttribute('style', "color: rgba(" + r + ", " + g + ", " + b + ", 1);");
      return messages.appendChild(message_node);
    };
    window.hook.on('*::message', function(m) {
      return addMessage(m.from, m.content);
    });
    window.hook.on('*::name', function(m) {
      return addMessage(m, 'Új böngésző');
    });
    submitMessage = function(message) {
      return hook.emit(name + '::message', {
        from: ownColor,
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

  FileSystem = (function() {
    var logError, _ref, _ref2;

    window.requestFileSystem = (_ref = window.requestFileSystem) != null ? _ref : window.webkitRequestFileSystem;

    window.BlobBuilder = (_ref2 = window.BlobBuilder) != null ? _ref2 : window.WebKitBlobBuilder;

    logError = function(e) {
      return console.log('error', e);
    };

    function FileSystem(size, temporary) {
      var _this = this;
      this.size = size;
      this.temporary = temporary != null ? temporary : true;
      this.ready = false;
      window.requestFileSystem(this.temporary ? window.TEMPORARY : window.PERSISTENT, this.size, function(fs) {
        _this.fs = fs;
        return _this.ready = true;
      }, function(e) {
        return console.log(e);
      });
    }

    FileSystem.prototype.store = function(filename, data, callback) {
      var onready;
      onready = function(fileEntry) {
        return fileEntry.createWriter(function(writer) {
          var bb;
          writer.onerror = logError;
          writer.onwriteend = function(e) {
            return callback(fileEntry.toURL());
          };
          bb = new BlobBuilder();
          bb.append(data);
          return writer.write(bb.getBlob('text/plain'));
        });
      };
      return this.fs.root.getFile(filename, {
        create: true,
        exclusive: true
      }, onready, logError);
    };

    FileSystem.prototype.read = function(filename, callback) {
      var onready;
      onready = function(fileEntry) {
        return fileEntry.file(function(file) {
          var reader;
          reader = new FileReader();
          reader.onloadend = function(e) {
            return callback(reader.result);
          };
          return reader.readAsText(file);
        });
      };
      return this.fs.root.getFile(filename, {}, onready, logError);
    };

    FileSystem.prototype["delete"] = function(filename, callback) {
      var onready;
      onready = function(fileEntry) {
        return fileEntry.remove(callback, logError);
      };
      return this.fs.root.getFile(filename, {
        create: false
      }, onready, logError);
    };

    return FileSystem;

  })();

  window.FileSystem = FileSystem;

}).call(this);
