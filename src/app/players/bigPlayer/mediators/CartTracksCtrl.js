var PlayerContext = require('../PlayerContext');
var favoriteTracks = require('../../../favoriteTracks/favoriteTracks');

module.exports = function CartTracksCtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var activeTrack = context.activeTrack;
  var cartTracks = context.cartTracks;
  var listeners;

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  function changeTrack(track) {
    context.setActivePlaylist(cartTracks);
    activeTrack.setTrack(track);
  }

  function onTracksChanged() {
    viewActions.onTracksChanged(cartTracks.getTracks());
  }

  function onActiveTrackChanged() {
    viewActions.onActiveTrackChanged(activeTrack.getTrack());
  }

  function onTrackAddedToFavs(track) {
    viewActions.onTrackAddedToFavs(track);
  }

  listeners = [
    viewActions.onDestroy.listen(destroy),
    viewActions.changeTrack.listen(changeTrack),
    cartTracks.onChange(onTracksChanged),
    activeTrack.onChange(onActiveTrackChanged),
    favoriteTracks.onTrackAdded(onTrackAddedToFavs)
  ];

  viewApi.setInitialData({
    tracks: cartTracks.getTracks(),
    activeTrack: activeTrack.getTrack()
  });
};
