
class FileSystem
  window.requestFileSystem = window.requestFileSystem ? window.webkitRequestFileSystem
  window.BlobBuilder = window.BlobBuilder ? window.WebKitBlobBuilder

  logError = (e) ->
    console.log 'error', e

  constructor : (@size, @temporary = true) ->
    @ready = false

    window.requestFileSystem \
      if @temporary then window.TEMPORARY else window.PERSISTENT,
      @size,
      (@fs) => @ready = true,
      (e) => console.log e

  store : (filename, data, callback) ->
    onready = (fileEntry) ->
      fileEntry.createWriter (writer) ->
        writer.onerror = logError
        writer.onwriteend = (e) ->
          callback fileEntry.toURL()

        bb = new BlobBuilder()
        bb.append data
        writer.write bb.getBlob('text/plain')

    @fs.root.getFile filename, {create : true, exclusive: true}, onready, logError

  read : (filename, callback) ->
    onready = (fileEntry) ->
      fileEntry.file (file) ->
        reader = new FileReader()

        reader.onloadend = (e) ->
          callback reader.result

        reader.readAsText(file)

    @fs.root.getFile filename, {}, onready, logError

  delete : (filename, callback) ->
    onready = (fileEntry) ->
      fileEntry.remove callback, logError

    @fs.root.getFile filename, {create: false}, onready, logError


window.FileSystem = FileSystem
