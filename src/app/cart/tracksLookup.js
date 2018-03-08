var store = require('store');

var KEY = 'ml.tracksLookup';

function createNewRecord(track) {
  return {
    refs: 0,
    track: track
  };
}

module.exports = {
  getTracks: function(ids) {
    if (!store.enabled) {
      return [];
    }

    var data = store.get(KEY) || {};
    var record;

    var tracks = [];

    ids.forEach(function(id) {
      record = data[id];
      if (typeof record === 'undefined') {
        return;
      }

      tracks.push(record.track);
    });

    return tracks;
  },
  add: function(track) {
    if (!store.enabled) {
      return;
    }

    var data = store.get(KEY) || {};
    var record = data[track.id] || createNewRecord(track);
    record.refs++;
    data[track.id] = record;
    store.set(KEY, data);
  },
  del: function(tracks) {
    if (!store.enabled) {
      return;
    }

    if (!Array.isArray(tracks)) {
      tracks = [tracks];
    }

    var data = store.get(KEY) || {};
    var record;
    tracks.forEach(function(track) {
      record = data[track.id];

      if (typeof record === 'undefined') {
        return;
      }

      record.refs--;

      if (record.refs < 1) {
        delete data[track.id];
      } else {
        data[track.id] = record;
      }
    });
    store.set(KEY, data);
  }
};
