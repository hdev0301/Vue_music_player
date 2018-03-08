var utils = require('./utils');

function concatChunks(chunks) {
  var byteLength = 0;
  chunks.forEach(function(arrayBuffer) {
    byteLength += arrayBuffer.byteLength;
  });

  var tmp = new Uint8Array(byteLength);
  var offset = 0;
  chunks.forEach(function(arrayBuffer) {
    tmp.set(new Uint8Array(arrayBuffer), offset);
    offset += arrayBuffer.byteLength;
  });
  return tmp.buffer;
}

function extractFileSize(contentRangeValue) {
  var regExp = /([^\/]+)$/;
  var arr = regExp.exec(contentRangeValue);
  if (Array.isArray(arr) && arr.length > 1) {
    return parseInt(arr[1], 10);
  }
  return NaN;
}

function loadChunk(url, startOffset, endOffset, cb) {
  var start = Date.now();

  // Safari return cached response for requests with "Range" header
  if (utils.isSafari()) {
    url += ('?_=' + Date.now());
  }

  var xhr = new window.XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.setRequestHeader('Range', 'bytes=' + startOffset + '-' + endOffset);
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      var fileSize;
      var headerValue = xhr.getResponseHeader('Content-Range');
      if (headerValue !== null) {
        fileSize = extractFileSize(headerValue);
      } else {
        fileSize = parseInt(xhr.getResponseHeader('Content-Length'), 10);
      }

      // seconds
      var requestDuration = (Date.now() - start) / 1000;

      cb(null, {
        data: xhr.response,
        fileSize: fileSize,
        bytesPerSecond: Math.floor(xhr.response.byteLength / requestDuration)
      });
      xhr = null;
    } else {
      cb({
        status: xhr.status
      });
      xhr = null;
    }
  };

  xhr.send();

  return {
    cancel: function() {
      if (xhr === null) {
        return;
      }
      xhr.abort();
      xhr = null;
    }
  };
}

function Loader(url) {
  var bytesTotal = 0;
  var bytesLoaded = 0;
  var networkSpeed = 0;

  var callbacks = {
    onChunkLoaded: utils.createCallback(),
    onError: utils.createCallback()
  };

  var isLoading = false;
  var isComplete = false;

  var chunks = [];

  var request = null;

  var api = {};

  api.getBytesTotal = function() {
    return bytesTotal;
  };

  api.getBytesLoaded = function() {
    return bytesLoaded;
  };

  api.getFileBuffer = function() {
    return concatChunks(chunks);
  };

  api.getNetworkSpeed = function() {
    return networkSpeed;
  };

  api.isComplete = function() {
    return isComplete;
  };

  function onChunkError(err) {
    isLoading = false;
    callbacks.onError(err);
  }

  function onChunkLoaded(result) {
    isLoading = false;
    if (bytesTotal === 0) {
      bytesTotal = result.fileSize;
    }
    networkSpeed = result.bytesPerSecond;
    chunks.push(result.data);
    bytesLoaded += result.data.byteLength;
    isComplete = bytesLoaded === bytesTotal;
    callbacks.onChunkLoaded();
  }

  api.loadNextChunk = function(byteLength) {
    if (isLoading || isComplete) {
      return;
    }
    isLoading = true;

    byteLength = Math.max(Math.floor(byteLength), Loader.MIN_BYTE_LENGTH);

    var startOffset = bytesLoaded;
    var endOffset = startOffset + byteLength - 1;
    if (bytesTotal > 0) {
      endOffset = Math.min(endOffset, bytesTotal - 1);
    }

    request = loadChunk(url, startOffset, endOffset, function(err, data) {
      request = null;
      if (err) {
        onChunkError(err);
      } else {
        onChunkLoaded(data);
      }
    });
  };

  api.destroy = function() {
    if (request !== null) {
      request.cancel();
    }
    request = null;

    while (chunks.length) {
      utils.freeArrayBuffer(chunks.pop());
    }
    chunks = null;
  };

  api.onChunkLoaded = function(fn) {
    return callbacks.onChunkLoaded.listen(fn);
  };

  api.onError = function(fn) {
    return callbacks.onError.listen(fn);
  };

  return api;
}

Loader.MIN_BYTE_LENGTH = 100 * 1000;

module.exports = Loader;
