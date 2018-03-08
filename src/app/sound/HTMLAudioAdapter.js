var utils = require('./utils');

module.exports = function HTMLAudioAdapter(sources) {
  var api = {};

  var actions = {
    onError: utils.createCallback()
  };
  var listeners = [];

  var audio = new window.Audio();

  // -----------------------------
  // common
  // -----------------------------
  var canPlay = false;

  api.onError = function(fn) {
    return actions.onError.listen(fn);
  };

  function onError() {
    actions.onError(audio.error);
  }

  audio.addEventListener('error', onError, false);

  // -----------------------------
  // play trait
  // -----------------------------
  actions.onPlay = utils.createCallback();
  actions.onPause = utils.createCallback();

  var isPlaying = false;
  var startPlaybackOnCanPlay = false;
  var loop = false;

  api.isPlaying = function() {
    return isPlaying;
  };

  api.play = function() {
    if (isPlaying) {
      return;
    }
    startPlaybackOnCanPlay = true;
    audio.play();
  };

  api.pause = function() {
    startPlaybackOnCanPlay = false;
    if (!isPlaying) {
      return;
    }
    audio.pause();
  };

  api.loopPlayback = function(value) {
    loop = value;
    audio.loop = value;
  };

  api.onPlay = function(fn) {
    return actions.onPlay.listen(fn);
  };

  api.onPause = function(fn) {
    return actions.onPause.listen(fn);
  };

  function onCanPlay() {
    canPlay = true;
    if (startPlaybackOnCanPlay) {
      startPlaybackOnCanPlay = false;

      if (!isPlaying) {
        audio.play();
      }
    }
  }

  function onPause() {
    if (!isPlaying) {
      return;
    }
    isPlaying = false;
    actions.onPause();
  }

  function onPlay() {
    if (isPlaying) {
      return;
    }
    isPlaying = true;
    actions.onPlay();
  }

  function onPlaybackEnded() {
    if (loop) {
      if (utils.isIOS()) {
        audio.play();
      }
    } else {
      onPause();
    }
  }

  audio.addEventListener('canplay', onCanPlay, false);
  audio.addEventListener('pause', onPause, false);
  audio.addEventListener('play', onPlay, false);
  audio.addEventListener('playing', onPlay, false);
  audio.addEventListener('ended', onPlaybackEnded, false);

  // -----------------------------
  // audio trait
  // -----------------------------
  actions.onVolumeChanged = utils.createCallback();
  actions.onMuted = utils.createCallback();
  actions.onUnMuted = utils.createCallback();

  var volume = 1;
  var isMuted = false;

  api.getVolume = function() {
    return volume;
  };

  api.setVolume = function(value) {
    if (value === volume) {
      return;
    }
    volume = value;
    audio.volume = volume;
    actions.onVolumeChanged(volume);
    api.unmute();
  };

  api.isMuted = function() {
    return isMuted;
  };

  api.mute = function() {
    if (isMuted === true) {
      return;
    }
    isMuted = true;
    audio.volume = 0;
    actions.onMuted();
  };

  api.unmute = function() {
    if (isMuted === false) {
      return;
    }
    isMuted = false;
    audio.volume = volume;
    actions.onUnMuted();
  };

  api.onVolumeChanged = function(fn) {
    return actions.onVolumeChanged.listen(fn);
  };

  api.onMuted = function(fn) {
    return actions.onMuted.listen(fn);
  };

  api.onUnMuted = function(fn) {
    return actions.onUnMuted.listen(fn);
  };

  // -----------------------------
  // time trait
  // -----------------------------
  actions.onCurrentTimeChanged = utils.createCallback();
  actions.onDurationChanged = utils.createCallback();
  actions.onComplete = utils.createCallback();

  var duration = 0;
  var hasExplicitDuration = false;

  api.getCurrentTime = function() {
    return audio.currentTime;
  };

  api.setCurrentTime = function(value) {
    if (!canPlay || value === audio.currentTime) {
      return;
    }
    audio.currentTime = value;
  };

  api.getDuration = function() {
    return duration;
  };

  api.setDuration = function(value) {
    if (hasExplicitDuration && value === duration) {
      return;
    }
    hasExplicitDuration = true;
    duration = value;
    actions.onDurationChanged(duration);
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

  function onTimeUpdated() {
    actions.onCurrentTimeChanged(api.getCurrentTime());
  }

  function onDurationChanged() {
    if (hasExplicitDuration) {
      return;
    }
    var value = audio.duration;
    if (isNaN(value)) {
      value = 0;
    }
    if (duration === value) {
      return;
    }
    duration = value;
    actions.onDurationChanged(duration);
  }

  function onEnded() {
    actions.onComplete();
  }

  audio.addEventListener('ended', onEnded, false);
  audio.addEventListener('timeupdate', onTimeUpdated, false);
  audio.addEventListener('durationchange', onDurationChanged, false);

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

  function onProgress() {
    if (audio.buffered.length < 1) {
      return;
    }
    var bufferedDuration = audio.buffered.end(0);
    var newLoaded = bufferedDuration / duration;
    if (isNaN(newLoaded)) {
      newLoaded = 0;
    }
    newLoaded = Math.min(1, Math.max(0, newLoaded));
    if (newLoaded === loaded) {
      return;
    }
    loaded = newLoaded;
    actions.onLoadProgress(loaded);
  }

  listeners.push(actions.onDurationChanged.listen(onProgress));

  var progressTimeout = null;

  function stopProgressTimeout() {
    if (progressTimeout === null) {
      return;
    }
    clearTimeout(progressTimeout);
    progressTimeout = null;
  }

  function startProgressTimeout() {
    if (progressTimeout !== null) {
      return;
    }

    progressTimeout = setTimeout(function() {
      stopProgressTimeout();
      onProgress();
      startProgressTimeout();
    }, 100);
  }

  function stopProgressTimeoutOnEnded() {
    stopProgressTimeout();
  }

  audio.addEventListener('ended', stopProgressTimeoutOnEnded, false);

  api.destroy = function() {
    audio.removeEventListener('error', onError, false);

    audio.removeEventListener('canplay', onCanPlay, false);
    audio.removeEventListener('pause', onPause, false);
    audio.removeEventListener('play', onPlay, false);
    audio.removeEventListener('playing', onPlay, false);
    audio.removeEventListener('ended', onPlaybackEnded, false);

    audio.removeEventListener('ended', onEnded, false);
    audio.removeEventListener('timeupdate', onTimeUpdated, false);
    audio.removeEventListener('durationchange', onDurationChanged, false);

    audio.removeEventListener('ended', stopProgressTimeoutOnEnded, false);
    stopProgressTimeout();

    while (listeners.length) {
      listeners.pop()();
    }

    audio.src = utils.isSafari() ? 'about:blank' : null;
    audio.removeAttribute('src');
  };

  audio.preload = 'auto';

  sources = utils.normalizeSources(sources);
  var urls = utils.getPlayableSources(sources);

  if (urls.length === 0) {
    setTimeout(function() {
      actions.onError('can not play audio');
    });
  } else {
    startProgressTimeout();
    audio.src = urls[0];
  }

  return api;
};
