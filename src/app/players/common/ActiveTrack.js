var Reflux = require('reflux');

module.exports = function ActiveTrack() {
  var api = {};

  var actions = {
    onChange: Reflux.createAction({
      sync: true
    })
  };

  var track = null;

  api.getTrack = function() {
    return track;
  };

  api.setTrack = function(newTrack) {
    if (!api.isEmpty() && newTrack !== null) {
      if (track.id === newTrack.id) {
        return;
      }
    }
    track = newTrack;
    if (typeof track === 'undefined') {
      track = null;
    }
    actions.onChange(track);
  };

  api.isEmpty = function() {
    return track === null;
  };

  api.onChange = function(fn) {
    return actions.onChange.listen(fn);
  };

  return api;
};
