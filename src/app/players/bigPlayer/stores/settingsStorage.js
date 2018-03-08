var store = require('store');

var KEY = 'ml.settings';

module.exports = {
  get: function(key) {
    if (!store.enabled) {
      return null;
    }

    var data = store.get(KEY) || {};
    return data[key] || null;
  },
  set: function(key, value) {
    if (!store.enabled) {
      return null;
    }
    var data = store.get(KEY) || {};
    data[key] = value;
    store.set(KEY, data);
  }
};
