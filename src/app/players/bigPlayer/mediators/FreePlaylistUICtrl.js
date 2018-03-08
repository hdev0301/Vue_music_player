var PlayerContext = require('../PlayerContext');

module.exports = function FreePlaylistUICtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var activeTrack = context.activeTrack;
  var listeners;

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  function onTrackChanged() {
    viewActions.onTrackChanged(activeTrack.getTrack());
  }

  listeners = [
    viewActions.onDestroy.listen(destroy),
    activeTrack.onChange(onTrackChanged)
  ];

  viewApi.setInitialData({
    track: activeTrack.getTrack(),
    isEmpty: activeTrack.isEmpty()
  });
};
