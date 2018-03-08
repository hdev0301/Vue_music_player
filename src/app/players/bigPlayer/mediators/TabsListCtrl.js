var PlayerContext = require('../PlayerContext');

module.exports = function TabsListCtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var userPlaylists = context.userPlaylists;
  var listeners;

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  function onPlaylistsChanged() {
    viewActions.onPlaylistsChanged(userPlaylists.getPlaylists());
  }

  function onPlaylistSelected() {
    viewActions.onPlaylistSelected(userPlaylists.getSelectedIndex());
  }

  function change(index) {
    userPlaylists.selectPlaylist(index);
    localStorage.setItem('selectedTab', index);
  }

  listeners = [
    viewActions.change.listen(change),
    viewActions.onDestroy.listen(destroy),
    userPlaylists.onChange(onPlaylistsChanged),
    userPlaylists.onPlaylistSelected(onPlaylistSelected)
  ];

  viewApi.setInitialData({
    playlists: userPlaylists.getPlaylists(),
    selected: userPlaylists.getSelectedIndex()
  });
};
