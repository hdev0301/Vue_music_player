var Reflux = require('reflux');
var backendProxy = require('./backendProxy');

var actions = {
  onTrackAdded: Reflux.createAction({
    sync: true
  }),
  onCountChange: Reflux.createAction({
    sync: true
  })
};

var count = 0;

var api = {};

api.getCount = function() {
  return count;
};

api.setCount = function(value) {
  if (count === value) {
    return;
  }
  count = value;
  actions.onCountChange(count);
};

api.add = function(track) {
  backendProxy.sendAddRequest(track, function(err, newCount) {
    if (err) {
      return;
    }

    actions.onTrackAdded(track);
    api.setCount(newCount);
  });
};

api.onTrackAdded = function(fn) {
  return actions.onTrackAdded.listen(fn);
};

api.onCountChange = function(fn) {
  return actions.onCountChange.listen(fn);
};

module.exports = api;
