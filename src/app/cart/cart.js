var StoredTracks = require('./StoredTracks');

var storedTracks = new StoredTracks({
  syncEventName: 'ml.cart::syncEvent',
  storageKey: 'ml.cart::tracks'
});

module.exports = storedTracks;
