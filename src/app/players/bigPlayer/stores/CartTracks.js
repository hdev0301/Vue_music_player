var Reflux = require('reflux');
var cart = require('../../../cart/cart');

module.exports = function CartTracks() {
  var actions = {
    onChange: Reflux.createAction({
      sync: true
    })
  };

  var tracks = [];
  var map = {};

  function updateTracks() {
    tracks = [];
    map = {};

    cart.getTracks().forEach(function(track, index) {
      map[track.id] = index;
      tracks.push(track);
    });

    actions.onChange(tracks);
  }

  cart.onChange(updateTracks);
  updateTracks();

  var api = {};

  api.getTracks = function() {
    return tracks;
  };

  api.getTrackIndex = function(track) {
    var notExistsResult = NaN;
    try {
      var index = map[track.id];
      if (typeof index === 'undefined') {
        return notExistsResult;
      }
      return index;
    }
    catch (e) {
    }
    return notExistsResult;
  };

  api.onChange = function(fn) {
    return actions.onChange.listen(fn);
  };

  return api;
};
