var logger = require('../../../logger');
var PlayerContext = require('../PlayerContext');

module.exports = function CycleUICtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var listeners;

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  function getLogData() {
    var track;

    try {
      track = context.activeTrack.getTrack().id;
    } catch (e) {
      track = null;
    }
    return {
      track: track,
      playlistUrl: context.userPlaylists.getSelectedPlaylist().url,
      currentTime: context.sound.getTimeTrait().getCurrentTime()
    };
  }

  function logCycleOn() {
    var data = getLogData();
    logger.onCycleOn(data.track, data.playlistUrl, data.currentTime);
  }

  function logCycleOff() {
    var data = getLogData();
    logger.onCycleOff(data.track, data.playlistUrl, data.currentTime);
  }

  function onActiveChanged() {
    viewActions.onActiveChanged(context.isLoopedPlayback());
  }

  function cycleOn() {
    context.setLoppedPlayback(true);
    onActiveChanged();
    logCycleOn();
  }

  function cycleOff() {
    context.setLoppedPlayback(false);
    onActiveChanged();
    logCycleOff();
  }

  listeners = [
    viewActions.onDestroy.listen(destroy),
    viewActions.cycleOn.listen(cycleOn),
    viewActions.cycleOff.listen(cycleOff)
  ];

  viewApi.setInitialData({
    active: context.isLoopedPlayback()
  });
};
