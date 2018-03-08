var Sound = require('../../sound/Sound');

var idCounter = 0;
var map = {};

module.exports = {
  create: function(track, options) {
    var id = idCounter++;

    var listeners;

    var sound = new Sound({
      forceHtmlAudio: true
    });

    var isEmptySound = true;

    function populateSound() {
      if (!isEmptySound) {
        return;
      }
      isEmptySound = false;
      sound.load(track.sources);
      sound.getTimeTrait().setDuration(track.duration);
    }

    function onSoundComplete() {
      sound.getSeekTrait().seek(0);
      sound.getPlayTrait().pause();
    }

    function play() {
      populateSound();
      sound.getPlayTrait().play();
    }

    function pause() {
      sound.getPlayTrait().pause();
    }

    function destroy() {
      while (listeners.length) {
        listeners.pop()();
      }
      sound.destroy();
      delete map[id];
    }

    listeners = [
      sound.getTimeTrait().onComplete(onSoundComplete)
    ];

    map[id] = {
      track: track,
      options: options,
      sound: sound,
      play: play,
      pause: pause,
      destroy: destroy
    };

    return id;
  },
  destroy: function(id) {
    var record = map[id] || null;
    if (record === null) {
      return;
    }
    record.destroy();
  },
  get: function(id) {
    return map[id];
  }
};
