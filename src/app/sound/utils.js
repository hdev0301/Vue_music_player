var api = {};

// --------------------------
// detect browsers
// --------------------------
var ua = navigator.userAgent;
var isOpera = /opera/gi.test(ua);
var isSafari = (ua.match(/safari/i) && !ua.match(/chrome/i));
var isIOS = /iphone|ipad/gi.test(ua);

api.isSafari = function() {
  return isSafari;
};

api.isIOS = function() {
  return isIOS;
};

api.chunkContainsDurationOfWholeAudio = function() {
  return isSafari;
};

// --------------------------
// common
// --------------------------
api.createCallback = function() {
  var listeners = [];

  function functor() {
    var args = Array.prototype.slice.call(arguments);
    listeners.forEach(function(fn) {
      fn.apply(null, args);
    });
  }

  functor.listen = function(fn) {
    listeners.push(fn);

    return function unsubscribe() {
      var index = listeners.indexOf(fn);
      if (index === -1) {
        return;
      }
      listeners.splice(index, 1);
    };
  };

  return functor;
};

// --------------------------
// audio / common
// --------------------------
var MIME_TYPE_OGG = 'audio/ogg; codecs="vorbis"';
var MIME_TYPE_MP3 = 'audio/mpeg';

function sourceToMimeType(source) {
  var arr = /([^\.\?]+)(\?.*)*$/.exec(source);
  if (!Array.isArray(arr) || arr.length === 0) {
    return 'unknown';
  }

  var extension = arr[1].toLowerCase();
  switch (extension) {
    case 'mp3':
      return MIME_TYPE_MP3;
    case 'ogg':
      return MIME_TYPE_OGG;
    default:
      return 'unknown';
  }
}

api.normalizeSources = function(sources) {
  if (!Array.isArray(sources)) {
    sources = [sources];
  }

  return sources.map(function(source) {
    if (typeof source === 'string') {
      return {
        url: source,
        type: sourceToMimeType(source)
      };
    }
    return source;
  });
};

var testAudio;
try {
  testAudio = new window.Audio();
}
catch (e) {
}

api.getPlayableSources = function(normalizedSources) {
  if (typeof testAudio === 'undefined') {
    return [];
  }

  var count = normalizedSources.length;
  var result = [];
  var source;
  var canPlayResult;
  var oggFileUrl = null;
  for (var i = 0; i < count; i++) {
    source = normalizedSources[i];
    console.log('source test', source);
    canPlayResult = testAudio.canPlayType(source.type);

    // force ogg file url will be first item
    if (source.type === MIME_TYPE_OGG && /probably|maybe/.test(canPlayResult)) {
      oggFileUrl = source.url;
      continue;
    }

    if (/probably/.test(canPlayResult)) {
      // Opera/Windows return 'probably' for 'audio/mpeg' but not play mp3 sound
      if (isOpera) {
        result.push(source.url);
      } else {
        result.unshift(source.url);
      }
    } else if (/maybe/.test(canPlayResult)) {
      result.push(source.url);
    }
  }

  if (oggFileUrl !== null) {
    result.unshift(oggFileUrl);
  }
  return result;
};

// --------------------------
// Web Audio API
// --------------------------
var AudioContextClass;
if (typeof window.AudioContext !== 'undefined') {
  AudioContextClass = window.AudioContext;
} else if (typeof window.webkitAudioContext !== 'undefined') {
  AudioContextClass = window.webkitAudioContext;
}

api.webAudioSupported = function() {
  return typeof AudioContextClass !== 'undefined';
};

api.createAudioContext = function() {
  var audioContext = new AudioContextClass();

  function onTouchStart() {
    window.removeEventListener('touchstart', onTouchStart, false);

    var buffer = audioContext.createBuffer(1, 1, 22050);
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(audioContext.currentTime);
  }

  if (isIOS) {
    window.addEventListener('touchstart', onTouchStart, false);
  }

  return audioContext;
};

// --------------------------
// Garbage collection for ArrayBuffers
// --------------------------
function createGcWorker() {
  var URL = window.URL || window.webkitURL;

  var blob = new window.Blob([' '], {
    type: 'text/javascript'
  });

  var s = URL.createObjectURL(blob);
  var worker = new window.Worker(s);
  URL.revokeObjectURL(s);

  var postFn;
  if (typeof worker.webkitPostMessage === 'function') {
    postFn = worker.webkitPostMessage;
  } else {
    postFn = worker.postMessage;
  }

  worker.postMessage = postFn;

  return worker;
}

function testTransferableSupport(worker) {
  var ab = new ArrayBuffer(1);
  worker.postMessage(ab, [ab]);
  return ab.byteLength === 0;
}

var gcWorker = null;
var transferableSupported = false;

api.freeArrayBuffer = function(arrayBuffer) {
  if (gcWorker === null) {
    gcWorker = createGcWorker();
    transferableSupported = testTransferableSupport(gcWorker);
  }

  if (gcWorker === null || !transferableSupported) {
    return;
  }

  gcWorker.postMessage(arrayBuffer, [arrayBuffer]);
};

api.freeAudioBuffer = function(audioBuffer) {
  for (var i = 0; i < audioBuffer.numberOfChannels; i++) {
    api.freeArrayBuffer(audioBuffer.getChannelData(i).buffer);
  }
};

module.exports = api;
