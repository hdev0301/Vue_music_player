var PlayerContext = require('../PlayerContext');

module.exports = function PlaybackBtnCtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var playTrait = context.sound.getPlayTrait();
  var timeTrait = context.sound.getTimeTrait();
  var listeners;

  function isPlaying() {
    return playTrait.isPlaying();
  }

  function onStateChanged() {
    if (isPlaying()) {
      viewActions.onPlay();
    } else {
      viewActions.onPause();
    }
  }

  function onCurrentTimeChange() {
    viewActions.onCurrentTimeChanged(timeTrait.getCurrentTime());
  }

  function onDurationChange() {
    viewActions.onDurationChanged(timeTrait.getDuration());
  }

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  listeners = [
    viewActions.onDestroy.listen(destroy),
    viewActions.play.listen(context.play),
    viewActions.pause.listen(context.pause),
    playTrait.onChange(onStateChanged),
    timeTrait.onCurrentTimeChange(onCurrentTimeChange),
    timeTrait.onDurationChange(onDurationChange)
  ];

  viewApi.setInitialData({
    playing: isPlaying(),
    duration: timeTrait.getDuration(),
    currentTime: timeTrait.getCurrentTime()
  });
};
