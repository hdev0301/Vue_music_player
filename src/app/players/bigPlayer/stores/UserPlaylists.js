var Reflux = require('reflux');

module.exports = function UserPlaylists() {
  var actions = {
    onChange: Reflux.createAction({
      sync: true
    }),
    onPlaylistSelected: Reflux.createAction({
      sync: true
    })
  };

  var playlists = [];
  var selectedIndex = NaN;

  var api = {};

  api.getPlaylists = function() {
    return playlists;
  };

  api.setPlaylists = function(newPlaylists) {
    playlists = newPlaylists;
    if (!Array.isArray(playlists)) {
      playlists = [];
    }
    selectedIndex = NaN;

    actions.onChange(playlists);
    actions.onPlaylistSelected(selectedIndex);
  };

  api.onChange = function(fn) {
    return actions.onChange.listen(fn);
  };

  api.selectPlaylist = function(index) {
    index = Math.max(0, Math.min(playlists.length - 1, index));
    if (index === selectedIndex) {
      return;
    }
    selectedIndex = index;
    actions.onPlaylistSelected(selectedIndex);
  };

  api.getSelectedIndex = function() {
    return selectedIndex;
  };

  api.getSelectedPlaylist = function() {
    if (api.hasSelected()) {
      return playlists[selectedIndex];
    }
    return null;
  };

  api.hasSelected = function() {
    return !isNaN(selectedIndex);
  };

  api.onPlaylistSelected = function(fn) {
    return actions.onPlaylistSelected.listen(fn);
  };

  return api;
};
