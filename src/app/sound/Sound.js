var Reflux = require('reflux');
var crosstab = require('crosstab');
var AudioTrait = require('./AudioTrait');
var LoadTrait = require('./LoadTrait');
var TimeTrait = require('./TimeTrait');
var SeekTrait = require('./SeekTrait');
var PlayTrait = require('./PlayTrait');
var HTMLAudioAdapter = require('./HTMLAudioAdapter');
var WebAudioAdapter = require('./WebAudioAdapter');
var utils = require('./utils');
var idCounter = 0;

var map = {};

var CROSSTAB_EVENT = 'ml.sound::pause';

function pauseLocalSounds(activeSoundId) {
  try {
    activeSoundId = activeSoundId.toString();
  }
  catch (e) {
  }

  Object.keys(map).forEach(function(id) {
    if (id === activeSoundId) {
      return;
    }
    map[id].getPlayTrait().pause();
  });
}

function pauseOtherSounds() {
  if (!crosstab.supported) {
    return;
  }
  crosstab.broadcast(CROSSTAB_EVENT);
}

if (crosstab.supported) {
  crosstab.on(CROSSTAB_EVENT, function(msg) {
    if (msg.origin === crosstab.id) {
      return;
    }
    pauseLocalSounds(null);
  });
}

module.exports = function Sound(options) {
  options = options || {};
  options.forceHtmlAudio = !!options.forceHtmlAudio;

  var api = {};

  var id = idCounter++;
  map[id] = api;

  var actions = {
    onAdapterChanged: Reflux.createAction({
      sync: true
    }),
    onDestroy: Reflux.createAction({
      sync: true
    })
  };

  var audioTrait = new AudioTrait(actions);
  var loadTrait = new LoadTrait(actions);
  var timeTrait = new TimeTrait(actions);
  var seekTrait = new SeekTrait(actions);
  var playTrait = new PlayTrait(actions);

  var listeners = [
    playTrait.onChange(function() {
      if (!playTrait.isPlaying()) {
        return;
      }
      pauseLocalSounds(id);
      pauseOtherSounds();
    })
  ];

  var adapter = null;

  api.load = function(sources) {
    api.unload();
    if (options.forceHtmlAudio || !utils.webAudioSupported()) {
      adapter = new HTMLAudioAdapter(sources);
    } else {
      adapter = new WebAudioAdapter(sources);
    }

    actions.onAdapterChanged(adapter);
  };

  api.unload = function() {
    if (adapter === null) {
      return;
    }
    adapter.destroy();
    adapter = null;
    actions.onAdapterChanged(null);
  };

  api.getAudioTrait = function() {
    return audioTrait;
  };

  api.getLoadTrait = function() {
    return loadTrait;
  };

  api.getTimeTrait = function() {
    return timeTrait;
  };

  api.getSeekTrait = function() {
    return seekTrait;
  };

  api.getPlayTrait = function() {
    return playTrait;
  };

  api.destroy = function() {
    while (listeners.length) {
      listeners.pop()();
    }

    delete map[id];

    api.unload();
    actions.onDestroy();
  };

  return api;
};
