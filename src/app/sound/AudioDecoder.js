var utils = require('./utils');

var decodingSpeed = 0;

module.exports = {
  getDecodingSpeed: function() {
    return decodingSpeed;
  },
  decode: function(audioContext, arrayBuffer, cb) {
    var cancelled = false;

    var start = Date.now();
    var byteLength = arrayBuffer.byteLength;

    function onComplete(audioBuffer) {
      if (cancelled) {
        utils.freeAudioBuffer(audioBuffer);
        return;
      }
      var decodingDuration = (Date.now() - start) / 1000;
      decodingSpeed = Math.floor(byteLength / decodingDuration);

      cb(null, audioBuffer);
    }

    function onError() {
      if (cancelled) {
        return;
      }
      cb(true);
    }

    audioContext.decodeAudioData(arrayBuffer, onComplete, onError);

    return {
      cancel: function() {
        cancelled = true;
      }
    };
  }
};
