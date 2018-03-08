var PlayerContext = require('../PlayerContext');
var logger = require('../../../logger');
var cart = require('../../../cart/cart');
var favoriteTracks = require('../../../favoriteTracks/favoriteTracks');

module.exports = function ControlPanelCtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var activeTrack = context.activeTrack;
  var sound = context.sound;
  var listeners;

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  function onTrackChanged() {
    viewActions.onTrackChanged(activeTrack.getTrack());
    onCartStateChange();
  }

  function onPlaybackStateChange() {
    if (sound.getPlayTrait().isPlaying()) {
      viewActions.onPlay();
    } else {
      viewActions.onPause();
    }
  }

  function activeTrackInCart() {
    return !(activeTrack.isEmpty() || !cart.contains(activeTrack.getTrack()));
  }

  function onCartStateChange() {
    if (!activeTrackInCart()) {
      viewActions.onOutCart();
    } else {
      viewActions.onInCart();
    }
  }

  function getLogData() {
    var track;
    try {
      track = activeTrack.getTrack().id;
    } catch (e) {
      track = null;
    }
    return {
      track: track,
      playlistUrl: context.userPlaylists.getSelectedPlaylist().url,
      currentTime: context.sound.getTimeTrait().getCurrentTime()
    };
  }

  function logAddToCart() {
    var data = getLogData();
    logger.onAddToCart(data.track, data.playlistUrl, data.currentTime);
  }

  function logDelFromCart() {
    var data = getLogData();
    logger.onDelFromCart(data.track, data.playlistUrl, data.currentTime);
  }

  function logAddToFavs() {
    var data = getLogData();
    logger.onAddToFavs(data.track, data.playlistUrl, data.currentTime);
  }

  function logPrevTrack() {
    var data = getLogData();
    logger.onPrevTrack(data.track, data.playlistUrl, data.currentTime);
  }

  function logNextTrack() {
    var data = getLogData();
    logger.onNextTrack(data.track, data.playlistUrl, data.currentTime);
  }

  function addToCart() {
    if (activeTrack.isEmpty()) {
      return;
    }
    cart.add(activeTrack.getTrack());
    logAddToCart();
  }

  function delFromCart() {
    if (activeTrack.isEmpty()) {
      return;
    }
    cart.del(activeTrack.getTrack());
    logDelFromCart();
  }

  function addToFavs() {
    if (activeTrack.isEmpty()) {
      return;
    }
    favoriteTracks.add(activeTrack.getTrack());
    logAddToFavs();
  }

  function prevTrack() {
    logPrevTrack();
    context.prevTrack();
  }

  function nextTrack() {
    logNextTrack();
    context.nextTrack();
  }

  listeners = [
    viewActions.prevTrack.listen(prevTrack),
    viewActions.nextTrack.listen(nextTrack),
    viewActions.play.listen(context.play),
    viewActions.pause.listen(context.pause),
    viewActions.addToFavs.listen(addToFavs),
    viewActions.addToCart.listen(addToCart),
    viewActions.delFromCart.listen(delFromCart),
    viewActions.onDestroy.listen(destroy),
    activeTrack.onChange(onTrackChanged),
    sound.getPlayTrait().onChange(onPlaybackStateChange),
    cart.onAdded(onCartStateChange),
    cart.onRemoved(onCartStateChange),
    cart.onClean(onCartStateChange)
  ];

  viewApi.setInitialData({
    track: activeTrack.getTrack(),
    isPlaying: sound.getPlayTrait().isPlaying(),
    inCart: activeTrackInCart()
  });
};
