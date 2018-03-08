var utils = require('./utils');
var Loader = require('./Loader');
var WebAudio = require('./WebAudio');
var AudioDecoder = require('./AudioDecoder');

var audioContext = null;

module.exports = function WebAudioAdapter(sources) {
  if (audioContext === null) {
    audioContext = utils.createAudioContext();
  }

  var loader = null;
  var audio = null;
  var listeners = [];
  var decodingJob = null;

  var api = {};

  var actions = {
    onError: utils.createCallback()
  };

  // -----------------------------
  // common
  // -----------------------------
  api.onError = function(fn) {
    return actions.onError.listen(fn);
  };

  // -----------------------------
  // play trait
  // -----------------------------
  actions.onPlay = utils.createCallback();
  actions.onPause = utils.createCallback();

  api.isPlaying = function() {
    return audio.isPlaying();
  };

  api.play = function() {
    audio.play();
  };

  api.pause = function() {
    audio.pause();
  };

  api.loopPlayback = function(value) {
    audio.loop(value);
  };

  api.onPlay = function(fn) {
    return actions.onPlay.listen(fn);
  };

  api.onPause = function(fn) {
    return actions.onPause.listen(fn);
  };

  // -----------------------------
  // audio trait
  // -----------------------------
  api.getVolume = function() {
  };

  api.setVolume = function(value) {
    audio.setVolume(value);
  };

  api.isMuted = function() {
  };

  api.mute = function() {
  };

  api.unmute = function() {
  };

  api.onVolumeChanged = function() {
  };

  api.onMuted = function() {
  };

  api.onUnMuted = function() {
  };

  // -----------------------------
  // time trait
  // -----------------------------
  actions.onCurrentTimeChanged = utils.createCallback();
  actions.onDurationChanged = utils.createCallback();
  actions.onComplete = utils.createCallback();

  api.getCurrentTime = function() {
    return audio.getCurrentTime();
  };

  api.setCurrentTime = function(time) {
    audio.setCurrentTime(time);
  };

  api.getDuration = function() {
  };

  api.setDuration = function() {
  };

  api.onCurrentTimeChanged = function(fn) {
    return actions.onCurrentTimeChanged.listen(fn);
  };

  api.onDurationChanged = function(fn) {
    return actions.onDurationChanged.listen(fn);
  };

  api.onComplete = function(fn) {
    return actions.onComplete.listen(fn);
  };

  // -----------------------------
  // load trait
  // -----------------------------
  actions.onLoadProgress = utils.createCallback();

  var loaded = 0;
  var total = 1;

  api.getLoaded = function() {
    return loaded;
  };

  api.getTotal = function() {
    return total;
  };

  api.onLoadProgress = function(fn) {
    return actions.onLoadProgress.listen(fn);
  };

  // -----------------------------
  // destroy
  // -----------------------------
  var destroyed = false;

  api.destroy = function() {
    if (destroyed) {
      return;
    }
    destroyed = true;

    while (listeners.length) {
      listeners.pop()();
    }

    if (decodingJob !== null) {
      decodingJob.cancel();
      decodingJob = null;
    }

    if (loader !== null) {
      loader.destroy();
      loader = null;
    }

    if (audio !== null) {
      audio.destroy();
      audio = null;
    }
  };

  // -----------------------------
  // start
  // -----------------------------
  sources = utils.normalizeSources(sources);
  var urls = utils.getPlayableSources(sources);

  function onDecodingResult(err, audioBuffer) {
    decodingJob = null;
    if (err) {
      if (!loader.isComplete()) {
        loader.loadNextChunk(Loader.MIN_BYTE_LENGTH);
      } else {
        // TODO: correctly handle this situation
        audio.onFullAudioBuffer();
      }
      return;
    }

    var duration = audioBuffer.duration;

    // duration of decoded audio chunk equals to total audio duration in Safari
    if (utils.chunkContainsDurationOfWholeAudio()) {
      duration = duration * loaded;
    }

    audio.updateAudioBuffer(audioBuffer, duration);
    if (loader.isComplete()) {
      audio.onFullAudioBuffer();
      return;
    }

    var remainingTime = Math.floor(audioBuffer.duration - audio.getCurrentTime()) - 1;
    remainingTime = Math.max(1, remainingTime);
    var secondsPerByte = 1 / AudioDecoder.getDecodingSpeed() + 1 / loader.getNetworkSpeed();
    var nextChunkByteLength = remainingTime / secondsPerByte;
    loader.loadNextChunk(Math.floor(nextChunkByteLength));
  }

  function onChunkLoaded() {
    loaded = loader.getBytesLoaded() / loader.getBytesTotal();
    actions.onLoadProgress(loaded);
    decodingJob = AudioDecoder.decode(audioContext, loader.getFileBuffer(), onDecodingResult);
  }

  if (urls.length === 0) {
    setTimeout(function() {
      actions.onError('can not play audio');
    });
  } else {
    audio = new WebAudio(audioContext);
    listeners.push(audio.onCurrentTimeChanged(actions.onCurrentTimeChanged));
    listeners.push(audio.onPlay(actions.onPlay));
    listeners.push(audio.onPause(actions.onPause));
    listeners.push(audio.onComplete(actions.onComplete));
    loader = new Loader(urls[0]);
    listeners.push(loader.onChunkLoaded(onChunkLoaded));

    loader.loadNextChunk(Loader.MIN_BYTE_LENGTH);
  }

  return api;
};
