var Reflux = require('reflux');

module.exports = function PlayTrait(soundActions) {
  var api = {};

  var playing = false;

  var soundListeners;
  var adapterListeners;
  var adapter = null;

  var loopPlayback = false;

  var actions = {
    onChange: Reflux.createAction({
      sync: true
    })
  };

  function applyLoopPlayback() {
    if (adapter === null) {
      return;
    }
    adapter.loopPlayback(loopPlayback);
  }

  function updateState(value) {
    if (playing === value) {
      return;
    }
    playing = value;
    actions.onChange(playing);
  }

  function setupAdapterListeners() {
    adapterListeners = [
      adapter.onPlay(function() {
        updateState(true);
      }),
      adapter.onPause(function() {
        updateState(false);
      }),
      adapter.onComplete(function() {
        updateState(false);
      })
    ];
  }

  function cleanAdapterListeners() {
    if (!Array.isArray(adapterListeners)) {
      return;
    }
    while (adapterListeners.length) {
      adapterListeners.pop()();
    }
    adapterListeners = null;
  }

  function onAdapterChanged(newAdapter) {
    cleanAdapterListeners();
    adapter = newAdapter;
    updateState(false);

    if (adapter === null) {
      return;
    }

    setupAdapterListeners();
    applyLoopPlayback();
  }

  function destroy() {
    cleanAdapterListeners();
    while (soundListeners.length) {
      soundListeners.pop()();
    }
    adapter = null;
  }

  soundListeners = [
    soundActions.onDestroy.listen(destroy),
    soundActions.onAdapterChanged.listen(onAdapterChanged)
  ];

  api.play = function() {
    if (adapter === null) {
      return;
    }
    adapter.play();
  };

  api.pause = function() {
    if (adapter === null) {
      return;
    }
    adapter.pause();
  };

  api.loopPlayback = function(value) {
    if (loopPlayback === value) {
      return;
    }
    loopPlayback = value;
    applyLoopPlayback();
  };

  api.isPlaying = function() {
    return playing;
  };

  api.onChange = function(fn) {
    return actions.onChange.listen(fn);
  };

  return api;
};
