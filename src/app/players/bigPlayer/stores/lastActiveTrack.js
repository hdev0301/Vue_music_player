var store = require('store');

var KEY = 'ml.lastActiveTrack';

var api = {};

api.get = function(playlistUrl) {
  if (!store.enabled) {
    return null;
  }
  var data = store.get(KEY) || {};
  return data[playlistUrl] || null;
};

api.set = function(playlistUrl, trackId) {
  if (!store.enabled) {
    return null;
  }
  var data = store.get(KEY) || {};
  data[playlistUrl] = trackId;
  store.set(KEY, data);
};

module.exports = api;
