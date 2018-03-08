var Reflux = require('reflux');
var tracksLoader = require('./tracksLoader');
var cart = require('../../../cart/cart');

function compareArrays(arr1, arr2) {
  if (arr1.length === 0 && arr2.length === 0) {
    return true;
  }

  if (arr1.length !== arr2.length) {
    return false;
  }

  return false;
}

var CART_PLAYLIST_URL = 'cart';

module.exports = function UserTracks() {
  var actions = {
    onChange: Reflux.createAction({
      sync: true
    }),
    onLoadStart: Reflux.createAction({
      sync: true
    }),
    onLoadSuccess: Reflux.createAction({
      sync: true
    }),
    onLoadError: Reflux.createAction({
      sync: true
    })
  };

  var tracks = [];
  var map = {};
  var request = null;
  var isLoading = false;
  var isError = false;

  function updateTracks(newTracks) {
    if (compareArrays(tracks, newTracks)) {
      return;
    }

    tracks = [];
    map = {};
    newTracks.forEach(function(track, index) {
      tracks.push(track);
      map[track.id] = index;
    });
    localStorage.setItem('activeTracks', JSON.stringify(newTracks));
    actions.onChange(tracks);
  }

  function cancelRequest() {
    try {
      request();
    }
    catch (e) {
    }
    request = null;
  }

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

  api.isLoading = function() {
    return isLoading;
  };

  api.isError = function() {
    return isError;
  };

  api.update = function(playlist) {
    cancelRequest();
    isError = false;

    var newTracks;

    if (playlist === null) {
      if (isLoading) {
        isLoading = false;
        actions.onLoadSuccess();
      }

      newTracks = [];
      updateTracks(newTracks);
      return;
    }

    if (playlist.url === CART_PLAYLIST_URL) {
      isError = false;

      if (isLoading) {
        isLoading = false;
        actions.onLoadSuccess();
      }

      updateTracks(cart.getTracks());
      return;
    }

    if (tracksLoader.hasCachedTracks(playlist.url)) {
      newTracks = tracksLoader.getCachedTracks(playlist.url);
      tracksLoader.removeFromCache(playlist.url);

      isError = false;

      if (isLoading) {
        isLoading = false;
        actions.onLoadSuccess();
      }

      updateTracks(newTracks);
      return;
    }

    if (!isLoading) {
      isLoading = true;
      actions.onLoadStart();
    }

    request = tracksLoader.load(playlist.url, function(err, newTracks) {
      isLoading = false;
      request = null;

      if (err) {
        isError = true;
        actions.onLoadError();
        return;
      }

      actions.onLoadSuccess();
      updateTracks(newTracks);
    });
  };

  api.onChange = function(fn) {
    return actions.onChange.listen(fn);
  };

  api.onLoadStart = function(fn) {
    return actions.onLoadStart.listen(fn);
  };

  api.onLoadSuccess = function(fn) {
    return actions.onLoadSuccess.listen(fn);
  };

  api.onLoadError = function(fn) {
    return actions.onLoadError.listen(fn);
  };

  return api;
};
