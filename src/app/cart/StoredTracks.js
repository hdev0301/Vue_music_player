var Reflux = require('reflux');
var store = require('store');
var crosstab = require('crosstab');
var tracksLookup = require('./tracksLookup');

var DEFAULT_SYNC_EVENT_NAME = 'ml.StoredTracks::syncEvent';
var DEFAULT_STORAGE_KEY = 'ml.StoredTracks::storageKey';

var SyncAction = {
  ADD: 0,
  DEL: 1,
  CLEAN: 2
};

function saveChanges(key, value) {
  if (!store.enabled) {
    return;
  }
  store.set(key, value);
}

function notifyOtherTabs(eventName, data) {
  if (!crosstab.supported) {
    return;
  }
  crosstab.broadcast(eventName, data);
}

module.exports = function StoredTracks(options) {
  var syncEventName = options.syncEventName || DEFAULT_SYNC_EVENT_NAME;
  var storageKey = options.storageKey || DEFAULT_STORAGE_KEY;

  var tracks = [];
  var ids = [];

  var actions = {
    onChange: Reflux.createAction({
      sync: true
    }),
    onAdded: Reflux.createAction({
      sync: true
    }),
    onRemoved: Reflux.createAction({
      sync: true
    }),
    onClean: Reflux.createAction({
      sync: true
    })
  };

  var api = {};

  crosstab.on(syncEventName, function(msg) {
    if (msg.origin === crosstab.id) {
      return;
    }
    api.sync(msg.data.action, msg.data.track);
  });

  api.getTracks = function() {
    return tracks;
  };

  api.sync = function(action, track) {
    if (!store.enabled) {
      return;
    }

    ids = store.get(storageKey) || [];
    tracks = tracksLookup.getTracks(ids);

    switch (action) {
      case SyncAction.ADD:
        actions.onAdded(track);
        break;
      case SyncAction.DEL:
        actions.onRemoved(track);
        break;
      case SyncAction.CLEAN:
        actions.onClean();
        break;
    }

    actions.onChange(tracks);
  };

  api.add = function(track) {
    if (api.contains(track)) {
      return;
    }

    ids.push(track.id);
    tracks.push(track);

    saveChanges(storageKey, ids);
    tracksLookup.add(track);

    actions.onAdded(track);
    actions.onChange(tracks);

    notifyOtherTabs(syncEventName, {
      action: SyncAction.ADD,
      track: track
    });
  };

  api.del = function(track) {
    if (!api.contains(track)) {
      return;
    }

    ids = ids.filter(function(id) {
      return id !== track.id;
    });

    tracks = tracks.filter(function(existingTrack) {
      return existingTrack.id !== track.id;
    });

    saveChanges(storageKey, ids);
    tracksLookup.del(track);

    actions.onRemoved(track);
    actions.onChange(tracks);

    notifyOtherTabs(syncEventName, {
      action: SyncAction.DEL,
      track: track
    });
  };

  api.clean = function() {
    if (ids.length === 0) {
      return;
    }

    ids = [];
    tracksLookup.del(tracks);
    tracks = [];

    saveChanges(storageKey, ids);

    actions.onClean();
    actions.onChange(tracks);

    notifyOtherTabs(syncEventName, {
      action: SyncAction.CLEAN,
      track: null
    });
  };

  api.contains = function(track) {
    return ids.indexOf(track.id) > -1;
  };

  api.onChange = function(fn) {
    return actions.onChange.listen(fn);
  };

  api.onAdded = function(fn) {
    return actions.onAdded.listen(fn);
  };

  api.onRemoved = function(fn) {
    return actions.onRemoved.listen(fn);
  };

  api.onClean = function(fn) {
    return actions.onClean.listen(fn);
  };

  return api;
};
