var Reflux = require('reflux');

module.exports = function LoadTrait(soundActions) {
  var actions = {
    onChange: Reflux.createAction({
      sync: true
    })
  };

  var loaded = 0;
  var total = 0;

  var soundListeners;
  var adapterListeners;

  var adapter = null;

  var api = {};

  function updateProgress(newLoaded, newTotal) {
    if (isNaN(newLoaded)) {
      newLoaded = 0;
    }

    if (isNaN(newTotal)) {
      newTotal = 0;
    }

    if (loaded === newLoaded && total === newTotal) {
      return;
    }
    loaded = newLoaded;
    total = newTotal;
    actions.onChange(loaded, total);
  }

  function setupAdapterListeners() {
    adapterListeners = [
      adapter.onLoadProgress(function() {
        var newLoaded = adapter.getLoaded();
        var newTotal = adapter.getTotal();
        updateProgress(newLoaded, newTotal);
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
    updateProgress(0, 0);

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

  api.getBytesLoaded = function() {
    return loaded;
  };

  api.getBytesTotal = function() {
    return total;
  };

  api.onChange = function(fn) {
    return actions.onChange.listen(fn);
  };

  return api;
};
