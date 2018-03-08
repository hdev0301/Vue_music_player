var Reflux = require('reflux');

function applyVolume(adapter, level) {
  try {
    adapter.setVolume(level);
  }
  catch (e) {
  }
}

module.exports = function AudioTrait(soundActions) {
  var api = {};

  var actions = {
    onChange: Reflux.createAction({
      sync: true
    }),
    onMutedChange: Reflux.createAction({
      sync: true
    })
  };

  var listeners;

  var adapter = null;

  function onAdapterChanged(newAdapter) {
    adapter = newAdapter;

    if (adapter === null) {
      return;
    }

    if (muted) {
      applyVolume(adapter, 0);
    } else {
      applyVolume(adapter, level);
    }
  }

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
    adapter = null;
  }

  listeners = [
    soundActions.onAdapterChanged.listen(onAdapterChanged),
    soundActions.onDestroy.listen(destroy)
  ];

  var level = 1;
  var muted = false;

  api.getVolume = function() {
    return level;
  };

  api.setVolume = function(value) {
    value = Math.max(0, Math.min(1, value));

    if (value === level) {
      return;
    }

    level = value;
    applyVolume(adapter, level);

    if (muted) {
      api.unmute();
    }

    actions.onChange(level);
  };

  api.mute = function() {
    if (muted) {
      return;
    }
    muted = true;
    applyVolume(adapter, 0);
    actions.onMutedChange(muted);
  };

  api.unmute = function() {
    if (!muted) {
      return;
    }
    muted = false;
    applyVolume(adapter, level);
    actions.onMutedChange(muted);
  };

  api.isMuted = function() {
    return muted;
  };

  api.onChange = function(fn) {
    return actions.onChange.listen(fn);
  };

  api.onMutedChange = function(fn) {
    return actions.onMutedChange.listen(fn);
  };

  return api;
};
