module.exports = function SeekTrait(soundActions) {
  var soundListeners;
  var adapter = null;

  function onAdapterChanged(newAdapter) {
    adapter = newAdapter;
  }

  function destroy() {
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

  api.seek = function(position) {
    if (adapter === null) {
      return;
    }
    adapter.setCurrentTime(position);
  };

  return api;
};
