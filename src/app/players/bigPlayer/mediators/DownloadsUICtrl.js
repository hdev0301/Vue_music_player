var PlayerContext = require('../PlayerContext');

module.exports = function DownloadsUICtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var cartTracks = context.cartTracks;
  var listeners;

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  function onTracksChanged() {
    viewActions.onTracksChanged(cartTracks.getTracks());
  }

  listeners = [
    viewActions.onDestroy.listen(destroy),
    cartTracks.onChange(onTracksChanged)
  ];

  viewApi.setInitialData({
    tracks: cartTracks.getTracks(),
    downloads: context.options.downloads
  });
};
