var Reflux = require('reflux');

module.exports = function TimeTrait(soundActions) {
  var currentTime = 0;
  var duration = 0;

  var soundListeners;
  var adapterListeners;
  var adapter = null;

  var actions = {
    onComplete: Reflux.createAction({
      sync: true
    }),
    onDurationChange: Reflux.createAction({
      sync: true
    }),
    onCurrentTimeChange: Reflux.createAction({
      sync: true
    })
  };

  function updateCurrentTime(value) {
    if (currentTime === value) {
      return;
    }
    currentTime = value;
    actions.onCurrentTimeChange(currentTime);
  }

  function applyDurationToAdapter() {
    if (adapter === null || duration === 0) {
      return;
    }
    adapter.setDuration(duration);
  }

  function updateDuration(value) {
    if (duration === value) {
      return;
    }
    duration = value;
    applyDurationToAdapter();
    actions.onDurationChange(duration);
  }

  function setupAdapterListeners() {
    adapterListeners = [
      adapter.onCurrentTimeChanged(updateCurrentTime),
      adapter.onComplete(actions.onComplete)
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
    updateCurrentTime(0);
    updateDuration(0);

    if (adapter === null) {
      return;
    }

    setupAdapterListeners();
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

  var api = {};

  api.getCurrentTime = function() {
    return currentTime;
  };

  api.getDuration = function() {
    return duration;
  };

  api.setDuration = function(value) {
    updateDuration(value);
  };

  api.onComplete = function(fn) {
    return actions.onComplete.listen(fn);
  };

  api.onDurationChange = function(fn) {
    return actions.onDurationChange.listen(fn);
  };

  api.onCurrentTimeChange = function(fn) {
    return actions.onCurrentTimeChange.listen(fn);
  };

  return api;
};
