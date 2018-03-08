var PlayerContext = require('../PlayerContext');

module.exports = function ProgressUICtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var activeTrack = context.activeTrack;
  var sound = context.sound;
  var timeTrait = sound.getTimeTrait();
  var loadTrait = sound.getLoadTrait();
  var seekTrait = sound.getSeekTrait();
  var listeners;

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  function onTrackChanged() {
    viewActions.onTrackChanged(activeTrack.getTrack());
  }

  function onCurrentTimeChange() {
    viewActions.onCurrentTimeChanged(timeTrait.getCurrentTime());
  }

  function onDurationChange() {
    viewActions.onDurationChanged(timeTrait.getDuration());
  }

  function onLoad() {
    viewActions.onLoad(loadTrait.getBytesLoaded(), loadTrait.getBytesTotal());
  }

  function seek(ratio) {
    var position = timeTrait.getDuration() * ratio;
    seekTrait.seek(position);
  }

  listeners = [
    viewActions.onDestroy.listen(destroy),
    viewActions.seek.listen(seek),
    timeTrait.onCurrentTimeChange(onCurrentTimeChange),
    timeTrait.onDurationChange(onDurationChange),
    loadTrait.onChange(onLoad),
    activeTrack.onChange(onTrackChanged)
  ];

  viewApi.setInitialData({
    track: activeTrack.getTrack(),
    hasTrack: !activeTrack.isEmpty(),
    duration: timeTrait.getDuration(),
    currentTime: timeTrait.getCurrentTime(),
    bytesLoaded: loadTrait.getBytesLoaded(),
    bytesTotal: loadTrait.getBytesTotal()
  });
};
