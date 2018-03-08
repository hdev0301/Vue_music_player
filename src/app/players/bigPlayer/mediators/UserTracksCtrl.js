var PlayerContext = require('../PlayerContext');
var favoriteTracks = require('../../../favoriteTracks/favoriteTracks');

module.exports = function UserTracksCtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var userTracks = context.userTracks;
  var activeTrack = context.activeTrack;
  var listeners;

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  function changeTrack(track) {
    context.setActivePlaylist(userTracks);
    activeTrack.setTrack(track);
  }

  function onTracksChanged() {
    viewActions.onTracksChanged(userTracks.getTracks());
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
    userTracks.onChange(onTracksChanged),
    activeTrack.onChange(onActiveTrackChanged),
    favoriteTracks.onTrackAdded(onTrackAddedToFavs)
  ];

  viewApi.setInitialData({
    tracks: userTracks.getTracks(),
    activeTrack: activeTrack.getTrack()
  });
};
