var store = require('store');

var KEY = 'ml.videoUrl';

var api = {};

api.get = function(key) {
  if (!store.enabled) {
    return null;
  }
  var data = store.get(KEY) || {};
  return data[key] || null;
};

api.set = function(key, value) {
  if (!store.enabled) {
    return null;
  }
  var data = store.get(KEY) || {};
  data[key] = value;
  store.set(KEY, data);
};

module.exports = api;
