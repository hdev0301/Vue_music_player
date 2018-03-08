var PlayerContext = require('../PlayerContext');

module.exports = function BigPlayerCtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var userTracks = context.userTracks;
  var userPlaylists = context.userPlaylists;
  var listeners;

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  function onLoadStart() {
    viewActions.onLoadStart();
  }

  function onLoadSuccess() {
    viewActions.onLoadSuccess();
  }

  function onLoadError() {
    viewActions.onLoadError();
  }

  function onPlaylistSelected() {
    viewActions.onPlaylistSelected(userPlaylists.getSelectedPlaylist());
  }

  listeners = [
    viewActions.onDestroy.listen(destroy),
    userTracks.onLoadStart(onLoadStart),
    userTracks.onLoadSuccess(onLoadSuccess),
    userTracks.onLoadError(onLoadError),
    userPlaylists.onPlaylistSelected(onPlaylistSelected)
  ];

  var initialData = {
    isReady: false,
    isError: false,
    isLoading: false,
    isFreePlaylist: false,
    isDownloadlist: false,
  };

  if (userTracks.isLoading()) {
    initialData.isLoading = true;
  } else if (userTracks.isError()) {
    initialData.isError = true;
  } else {
    initialData.isReady = true;
  }

  try {
    initialData.isFreePlaylist = userPlaylists.getSelectedPlaylist().free;
    initialData.isDownloadlist = userPlaylists.getSelectedPlaylist().download;
  }
  catch (e) {
  }

  var downloadsValue = context.options.downloads;
  initialData.hasDownloads = !isNaN(downloadsValue) && downloadsValue > 0;

  viewApi.setInitialData(initialData);
};
