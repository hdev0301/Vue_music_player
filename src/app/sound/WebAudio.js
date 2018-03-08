var utils = require('./utils');

var isWebkit = typeof window.chrome !== 'undefined' || utils.isSafari();

module.exports = function WebAudio(audioContext) {
  var callbacks = {
    onCurrentTimeChanged: utils.createCallback(),
    onComplete: utils.createCallback(),
    onPlay: utils.createCallback(),
    onPause: utils.createCallback(),
    onCanPlay: utils.createCallback()
  };

  var audioBuffer = null;
  // we need this variable because duration of decoded audio chunk
  // equals to total audio duration in iOS/Safari
  var audioBufferDuration = 0;

  var chunks = [];

  var api = {};

  var hasFullAudioBuffer = false;
  var isPlaying = false;
  var isLoopState = false;
  var awaitingNextChunk = false;
  var loopedChunkIsActive = false;

  var currentTime = 0;

  var volume = 1;

  function saveCurrentTime(value) {
    currentTime = value;
    notifyCurrentTimeChange();
  }

  function applyVolume() {
    chunks.forEach(function(chunk) {
      chunk.gainNode.gain.value = volume;
    });
  }

  function notifyCurrentTimeChange() {
    callbacks.onCurrentTimeChanged(api.getCurrentTime());
  }

  function createChunk(chunkAudioBuffer, chunkAudioBufferDuration, startOffset, scheduleTime) {
    var bufferSource = audioContext.createBufferSource();
    var gainNode = audioContext.createGain();
    gainNode.gain.value = volume;

    var destroyed = false;

    var chunk = {
      bufferSource: bufferSource,
      gainNode: gainNode,
      duration: chunkAudioBufferDuration - startOffset,
      startOffset: startOffset,
      scheduleTime: scheduleTime
    };
    bufferSource.buffer = chunkAudioBuffer;

    bufferSource.onended = function() {
      if (destroyed) {
        return;
      }
      onChunkEnded(chunk);
    };

    bufferSource.connect(gainNode);
    gainNode.connect(audioContext.destination);
    bufferSource.start(scheduleTime, startOffset, chunk.duration);

    chunk.destroy = function() {
      destroyed = true;

      gainNode.disconnect();
      gainNode = null;
      chunk.gainNode = null;

      if (bufferSource.buffer !== audioBuffer) {
        utils.freeAudioBuffer(bufferSource.buffer);
      }

      try {
        bufferSource.stop(audioContext.currentTime);
      }
      catch (e) {
      }

      bufferSource.disconnect();

      try {
        bufferSource.buffer = null;
      }
      catch (e) {
      }
      bufferSource = null;
      chunk.bufferSource = null;

      chunk = null;
    };
    return chunk;
  }

  function clearSequence() {
    while (chunks.length) {
      chunks.pop().destroy();
    }
    loopedChunkIsActive = false;
  }

  function startNewSequence() {
    var time = api.getCurrentTime();
    clearSequence();
    chunks.push(createChunk(audioBuffer, audioBufferDuration, time, audioContext.currentTime));
  }

  function scheduleNextChunk() {
    var prevChunk = null;
    if (chunks.length > 0) {
      prevChunk = chunks[chunks.length - 1];
    }

    var startOffset = 0;
    if (prevChunk !== null) {
      startOffset = prevChunk.startOffset + prevChunk.duration;
    }

    var scheduleTime = audioContext.currentTime;
    if (prevChunk !== null) {
      scheduleTime = prevChunk.scheduleTime + prevChunk.duration;
    }

    chunks.push(createChunk(audioBuffer, audioBufferDuration, startOffset, scheduleTime));
  }

  function scheduleLoopChunk() {
    var prevChunk = chunks[chunks.length - 1];

    var startOffset = 0;

    var scheduleTime = prevChunk.scheduleTime + prevChunk.duration;

    var chunk = createChunk(audioBuffer, audioBufferDuration, startOffset, scheduleTime);
    chunk.bufferSource.loop = true;
    chunks.push(chunk);
  }

  function onChunkEnded(chunk) {
    var index = chunks.indexOf(chunk);
    var isPenultChunk = index === chunks.length - 2;
    chunks.splice(index, 1);
    chunk.destroy();

    // the last chunk before the looped chunk is completed
    if (hasFullAudioBuffer && isLoopState && isPenultChunk) {
      // reset currentTime
      saveCurrentTime(0);

      // mark that we play looped chunk
      loopedChunkIsActive = true;
      return;
    }

    // audio reached the end
    if (hasFullAudioBuffer && chunks.length === 0) {
      onAudioComplete();
      return;
    }

    // Not enough data. Next chunk still loading.
    if (!hasFullAudioBuffer && chunks.length === 0) {
      // Save duration of audio that has been played and wait next chunk
      saveCurrentTime(audioContext.currentTime - chunk.scheduleTime + chunk.startOffset);
      awaitingNextChunk = true;
    }
  }

  function onAudioComplete() {
    api.pause();
    saveCurrentTime(0);
    callbacks.onComplete();
  }

  var timeout = NaN;

  function startTimeout() {
    if (!isNaN(timeout)) {
      return;
    }

    timeout = setTimeout(function() {
      timeout = NaN;

      if (!awaitingNextChunk) {
        notifyCurrentTimeChange();
      }

      startTimeout();
    }, 200);
  }

  function stopTimeout() {
    if (isNaN(timeout)) {
      return;
    }
    clearTimeout(timeout);
    timeout = NaN;
  }

  api.getCurrentTime = function() {
    if (chunks.length === 0) {
      return currentTime;
    }

    var value = audioContext.currentTime - chunks[0].scheduleTime + chunks[0].startOffset;
    if (hasFullAudioBuffer) {
      while (value > audioBufferDuration) {
        value -= audioBufferDuration;
      }
    }

    return value;
  };

  api.setCurrentTime = function(time) {
    if (audioBuffer === null) {
      return;
    }

    time = Math.max(0, Math.min(time, audioBufferDuration - 0.5));
    if (api.getCurrentTime() === time) {
      return;
    }

    clearSequence();
    saveCurrentTime(time);

    if (!isPlaying) {
      return;
    }

    awaitingNextChunk = false;

    startNewSequence();

    if (isLoopState && hasFullAudioBuffer) {
      scheduleLoopChunk();
    }
  };

  api.isPlaying = function() {
    return isPlaying;
  };

  api.play = function() {
    if (isPlaying) {
      return;
    }
    isPlaying = true;
    callbacks.onPlay();

    if (audioBuffer === null || awaitingNextChunk) {
      return;
    }

    startNewSequence();

    if (isLoopState && hasFullAudioBuffer) {
      scheduleLoopChunk();
    }

    notifyCurrentTimeChange();
    startTimeout();
  };

  api.pause = function() {
    if (!isPlaying) {
      return;
    }
    isPlaying = false;

    saveCurrentTime(api.getCurrentTime());
    clearSequence();
    stopTimeout();
    awaitingNextChunk = false;
    callbacks.onPause();
  };

  api.loop = function(value) {
    if (isLoopState === value) {
      return;
    }
    isLoopState = value;

    if (!hasFullAudioBuffer || !isPlaying) {
      return;
    }

    if (isLoopState) {
      scheduleLoopChunk();
    } else {
      var chunk;
      if (loopedChunkIsActive) {
        // in this case 'chunks' array contains single chunk that is looped chunk (see _onChunkEnded)
        chunk = chunks[0];
        chunk.bufferSource.loop = false;
      } else {
        // if we still play chunk that placed before lopped chunk
        // then just remove looped chunk (it should be the last chunk in _chunks array)
        chunks.pop().destroy();
      }
      loopedChunkIsActive = false;
    }
  };

  api.setVolume = function(value) {
    volume = value;
    applyVolume();
  };

  api.updateAudioBuffer = function(newAudioBuffer, newAudioBufferDuration) {
    if (hasFullAudioBuffer) {
      return;
    }

    if (chunks.length === 0 && audioBuffer !== null) {
      utils.freeAudioBuffer(audioBuffer);
    }

    audioBuffer = newAudioBuffer;

    if (!isNaN(newAudioBufferDuration)) {
      audioBufferDuration = newAudioBufferDuration;
    } else {
      audioBufferDuration = audioBuffer.duration;
    }

    var shouldStartNewSequence = isWebkit || awaitingNextChunk;
    awaitingNextChunk = false;

    if (!isPlaying) {
      return;
    }
    if (shouldStartNewSequence) {
      startNewSequence();
    } else {
      scheduleNextChunk();
    }
    startTimeout();
  };

  api.destroy = function() {
    clearSequence();
    stopTimeout();
    if (audioBuffer !== null) {
      utils.freeAudioBuffer(audioBuffer);
    }
    audioBuffer = null;
    audioContext = null;
    chunks = null;
  };

  api.onFullAudioBuffer = function() {
    if (hasFullAudioBuffer) {
      return;
    }
    hasFullAudioBuffer = true;

    if (isPlaying && isLoopState) {
      scheduleLoopChunk();
    }
  };

  api.onPlay = function(fn) {
    return callbacks.onPlay.listen(fn);
  };

  api.onPause = function(fn) {
    return callbacks.onPause.listen(fn);
  };

  api.onCurrentTimeChanged = function(fn) {
    return callbacks.onCurrentTimeChanged.listen(fn);
  };

  api.onComplete = function(fn) {
    return callbacks.onComplete.listen(fn);
  };

  return api;
};
