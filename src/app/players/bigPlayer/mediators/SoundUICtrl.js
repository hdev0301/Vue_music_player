var PlayerContext = require('../PlayerContext');

module.exports = function SoundUICtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var audioTrait = context.sound.getAudioTrait();
  var listeners;

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  function onVolumeChanged() {
    viewActions.onVolumeChanged(audioTrait.getVolume());
  }

  function onMutedChange() {
    if (audioTrait.isMuted()) {
      viewActions.onMuted();
    } else {
      viewActions.onUnMuted();
    }
  }

  function changeVolume(volume) {
    audioTrait.setVolume(volume);
  }

  listeners = [
    viewActions.onDestroy.listen(destroy),
    viewActions.changeVolume.listen(changeVolume),
    viewActions.mute.listen(audioTrait.mute),
    viewActions.unmute.listen(audioTrait.unmute),
    audioTrait.onChange(onVolumeChanged),
    audioTrait.onMutedChange(onMutedChange)
  ];

  viewApi.setInitialData({
    volume: audioTrait.getVolume(),
    muted: audioTrait.isMuted()
  });
};
