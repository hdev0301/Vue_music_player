var ActiveTrack = require('../common/ActiveTrack');
var Sound = require('../../sound/Sound');
var UserPlaylists = require('./stores/UserPlaylists');
var UserTracks = require('./stores/UserTracks');
var CartTracks = require('./stores/CartTracks');
var tracksLoader = require('./stores/tracksLoader');
var settingsStorage = require('./stores/settingsStorage');
var cart = require('../../cart/cart');
var lastActiveTrack = require('./stores/lastActiveTrack');

var idCounter = 0;
var map = {};

var KEY_LOOP = 'loopPlayback';
var LOOP_VALUE = 1;

var KEY_VOLUME = 'volume';
var KEY_MUTED = 'muted';

module.exports = {
  create: function(playlists, options) {
    var id = idCounter++;

    var activeTrack = new ActiveTrack();
    var sound = new Sound({
      forceHtmlAudio: options.forceHtmlAudio
    });
    var userPlaylists = new UserPlaylists();
    var userTracks = new UserTracks();
    var cartTracks = new CartTracks();

    var activePlaylist = userTracks;
    var activeTrackIndex = -1;

    var startPlaybackOnTrackChanged = options.autoplay === true;

    var isLoopedPlayback = settingsStorage.get(KEY_LOOP) === LOOP_VALUE;
    sound.getPlayTrait().loopPlayback(isLoopedPlayback);

    var storedVolume = settingsStorage.get(KEY_VOLUME);
    if (!isNaN(parseFloat(storedVolume))) {
      sound.getAudioTrait().setVolume(storedVolume);
    }

    var storedMuted = settingsStorage.get(KEY_MUTED);
    if (storedMuted === true) {
      sound.getAudioTrait().mute();
    }
    var currentDuration = 0;
    var originBack = false;
    window.addEventListener('onActiveDurationChanged', function(e) {
      currentDuration = e.detail.duration;
      originBack = e.detail.back;
      updateSound();
    });

    function updateSound() {
      if (activeTrack.isEmpty()) {
        sound.unload();
      } else {
        var track = activeTrack.getTrack();
        if (track.availableDurations.length === 0) {
          sound.load(track.sources);
          sound.getTimeTrait().setDuration(track.duration);
        } else {
          var regExp = /([^\/]+)\.[^.]+$/;
          try {
            var fileName = regExp.exec(track.sources[0])[1];
            var currentSources = [];
            // var url = '/demo/sounds/';
            var url = 'https://cdn.melodyloops.com/mp3/';
            if (currentDuration === 0 || originBack === true) {
              currentSources[0] = url + fileName + '.ogg';
              currentSources[1] = url + fileName + '.mp3';
            } else {
              currentSources[0] = url + fileName + '-' + currentDuration + '.ogg';
              currentSources[1] = url + fileName + '-' + currentDuration + '.mp3';
            }
            currentSources = Object.assign([], currentSources);
            sound.load(currentSources);
            sound.getTimeTrait().setDuration(currentDuration);
          }
          catch (e) {
          }
        }
        sound.getPlayTrait().play();
      }
      window.removeEventListener('onActiveDurationChanged', function(e) {
        console.log(e);
      });
    }

    function play() {
      sound.getPlayTrait().play();
    }

    function pause() {
      sound.getPlayTrait().pause();
    }

    function hasNextTrack() {
      if (activeTrack.isEmpty()) {
        return false;
      }

      return activePlaylist.getTracks().length > 1;
    }

    function nextTrack() {
      if (activeTrack.isEmpty()) {
        return;
      }
      var index = activePlaylist.getTrackIndex(activeTrack.getTrack());
      if (isNaN(index)) {
        return;
      }
      var tracks = activePlaylist.getTracks();

      var newIndex = index + 1;
      if (newIndex >= tracks.length) {
        newIndex = 0;
      }

      if (newIndex === index) {
        return;
      }

      activeTrack.setTrack(tracks[newIndex]);
    }

    function prevTrack() {
      if (activeTrack.isEmpty()) {
        return;
      }
      var index = activePlaylist.getTrackIndex(activeTrack.getTrack());
      if (isNaN(index)) {
        return;
      }
      var tracks = activePlaylist.getTracks();

      var newIndex = index - 1;
      if (newIndex < 0) {
        newIndex = tracks.length - 1;
      }

      if (newIndex === index) {
        return;
      }

      activeTrack.setTrack(tracks[newIndex]);
    }

    function onPlaylistSelected() {
      userTracks.update(userPlaylists.getSelectedPlaylist());
    }

    function onUserTracksChanged() {
      activePlaylist = userTracks;
      var lastActiveTrackId = lastActiveTrack.get(userPlaylists.getSelectedPlaylist().url);
      var index = userTracks.getTrackIndex({
        id: lastActiveTrackId
      });
      if (isNaN(index)) {
        index = 0;
      }
      activeTrack.setTrack(userTracks.getTracks()[index]);
    }

    function onUserTracksLoadStart() {
      activeTrack.setTrack(null);
    }

    function onActiveTrackChanged() {
      var track = activeTrack.getTrack();
      if (!activeTrack.isEmpty()) {
        lastActiveTrack.set(userPlaylists.getSelectedPlaylist().url, track.id);
      }
      activeTrackIndex = activePlaylist.getTrackIndex(track);
      updateSound();
      if (activeTrack.isEmpty()) {
        return;
      }
      if (startPlaybackOnTrackChanged) {
        play();
      }
      startPlaybackOnTrackChanged = true;
    }

    function onSoundComplete() {
      if (hasNextTrack()) {
        nextTrack();
      } else {
        sound.getPlayTrait().pause();
        sound.getSeekTrait().seek(0);
      }
    }

    function setLoppedPlayback(value) {
      if (isLoopedPlayback === value) {
        return;
      }
      isLoopedPlayback = value;
      settingsStorage.set(KEY_LOOP, value === true ? LOOP_VALUE : 0);
      sound.getPlayTrait().loopPlayback(isLoopedPlayback);
    }

    function onVolumeChanged() {
      settingsStorage.set(KEY_VOLUME, sound.getAudioTrait().getVolume());
    }

    function onMutedChanged() {
      settingsStorage.set(KEY_MUTED, sound.getAudioTrait().isMuted());
    }

    function onCartTracksChanged(removedTrack) {
      var skip = activePlaylist !== cartTracks ||
        cartTracks.getTracks().length === 0 ||
        activeTrack.isEmpty() ||
        activeTrack.getTrack().id !== removedTrack.id;

      if (skip) {
        return;
      }

      var tracks = cartTracks.getTracks();
      if (tracks.length === 1) {
        activeTrack.setTrack(tracks[0]);
        return;
      }

      if (activeTrackIndex === 0) {
        activeTrack.setTrack(tracks[0]);
        return;
      }

      activeTrack.setTrack(tracks[activeTrackIndex - 1]);
    }

    function onTrackRemovedFromCart(track) {
      setTimeout(function() {
        onCartTracksChanged(track);
      });
    }

    // TODO: listeners
    userPlaylists.onPlaylistSelected(onPlaylistSelected);
    userTracks.onChange(onUserTracksChanged);
    userTracks.onLoadStart(onUserTracksLoadStart);
    activeTrack.onChange(onActiveTrackChanged);
    sound.getTimeTrait().onComplete(onSoundComplete);
    sound.getAudioTrait().onChange(onVolumeChanged);
    sound.getAudioTrait().onMutedChange(onMutedChanged);
    cart.onRemoved(onTrackRemovedFromCart);

    var selectedPlaylistIndex = 0;
    playlists.forEach(function(playlist, index) {
      if (playlist.active) {
        selectedPlaylistIndex = index;
      }

      if (Array.isArray(playlist.tracks) && playlist.tracks.length > 0) {
        tracksLoader.addToCache(playlist.url, playlist.tracks);
      }
    });
    userPlaylists.setPlaylists(playlists);

    if (localStorage.getItem('selectedTab') !== undefined) {
      selectedPlaylistIndex = localStorage.getItem('selectedTab');
    }
    userPlaylists.selectPlaylist(selectedPlaylistIndex);

    map[id] = {
      options: options,
      activeTrack: activeTrack,
      sound: sound,
      userPlaylists: userPlaylists,
      userTracks: userTracks,
      cartTracks: cartTracks,
      play: play,
      pause: pause,
      setActivePlaylist: function(playlist) {
        activePlaylist = playlist;
      },
      nextTrack: nextTrack,
      prevTrack: prevTrack,
      isLoopedPlayback: function() {
        return isLoopedPlayback;
      },
      setLoppedPlayback: setLoppedPlayback
    };

    return id;
  },
  get: function(id) {
    return map[id];
  }
};
