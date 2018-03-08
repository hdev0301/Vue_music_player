var reqwest = require('reqwest');
var config = require('../misc/config');

var Actions = {
  CYCLE_ON: 8,
  CYCLE_OFF: 9,
  ADD_TO_CART: 4,
  DEL_FROM_CART: 5,
  NEXT_TRACK: 3,
  PREV_TRACK: 1,
  ADD_TO_FAVS: 7
};

var END_POINT = '/engine/saveplayeraction.php';

function makeParams(action, trackId, playlistUrl, playbackCurrentTime) {
  return {
    action: action,
    id: trackId,
    list: playlistUrl,
    pos: playbackCurrentTime,
    uuid: config.data.userId || ''
  };
}

function send(params) {
  var cfg = {
    url: END_POINT,
    type: 'text',
    data: params
  };
  reqwest(cfg);
}

module.exports = {
  onCycleOn: function(trackId, playlistUrl, playbackCurrentTime) {
    send(makeParams(Actions.CYCLE_ON, trackId, playlistUrl, playbackCurrentTime));
  },
  onCycleOff: function(trackId, playlistUrl, playbackCurrentTime) {
    send(makeParams(Actions.CYCLE_OFF, trackId, playlistUrl, playbackCurrentTime));
  },
  onAddToCart: function(trackId, playlistUrl, playbackCurrentTime) {
    send(makeParams(Actions.ADD_TO_CART, trackId, playlistUrl, playbackCurrentTime));
  },
  onDelFromCart: function(trackId, playlistUrl, playbackCurrentTime) {
    send(makeParams(Actions.DEL_FROM_CART, trackId, playlistUrl, playbackCurrentTime));
  },
  onNextTrack: function(trackId, playlistUrl, playbackCurrentTime) {
    send(makeParams(Actions.NEXT_TRACK, trackId, playlistUrl, playbackCurrentTime));
  },
  onPrevTrack: function(trackId, playlistUrl, playbackCurrentTime) {
    send(makeParams(Actions.PREV_TRACK, trackId, playlistUrl, playbackCurrentTime));
  },
  onAddToFavs: function(trackId, playlistUrl, playbackCurrentTime) {
    send(makeParams(Actions.ADD_TO_FAVS, trackId, playlistUrl, playbackCurrentTime));
  }
};
