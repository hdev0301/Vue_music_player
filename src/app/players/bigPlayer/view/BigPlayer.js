var Reflux = require('reflux');
var Vue = require('vue');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');

var MiniPlayer = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  actionsFactory: function() {
    return {
      onLoadStart: Reflux.createAction({
        sync: true
      }),
      onLoadSuccess: Reflux.createAction({
        sync: true
      }),
      onLoadError: Reflux.createAction({
        sync: true
      }),
      onPlaylistSelected: Reflux.createAction({
        sync: true
      })
    };
  },
  name: ComponentName.BIG_PLAYER,
  created: function() {
    window.addEventListener('onVideoAdded', function() {
      var videoSection = document.getElementById('videoSection');
      videoSection.className = 'player-section video-overlay-section';
    }, false);
    window.addEventListener('onVideoClosed', function() {
      var videoSection = document.getElementById('videoSection');
      videoSection.className = 'player-section video-overlay-section none';
    }, false);
  },
  ready: function() {
    /*this.$on('leftkeydown', function(e) {
      this.$broadcast('leftkeydown', e);
    });
    this.$on('rightkeydown', function(e) {
      this.$broadcast('rightkeydown', e);
    });*/
    var actions = this.getActions();
    this.listenTo(actions.onLoadStart, this.onLoadStart);
    this.listenTo(actions.onLoadSuccess, this.onLoadSuccess);
    this.listenTo(actions.onLoadError, this.onLoadError);
    this.listenTo(actions.onPlaylistSelected, this.onPlaylistSelected);
  },
  data: function() {
    return {
      isReady: false,
      isError: false,
      isLoading: false,
      isFreePlaylist: false,
      isDownloadlist: false,
      hasDownloads: false
    };
  },
  replace: true,
  template: require('../tpl/big-player.tpl.html'),
  components: {
    'tabs-list': require('./TabsList'),
    'user-tracks': require('./UserTracks'),
    'cart-tracks': require('./CartTracks'),
    'author-link': require('./AuthorLink'),
    'track-link': require('./TrackLink'),
    'control-panel': require('./ControlPanel'),
    'cart-ui': require('./CartUI'),
    'progress-ui': require('./ProgressUI'),
    'cycle-ui': require('./CycleUI'),
    'sound-ui': require('./SoundUI'),
    'video-ui': require('./VideoUI'),
    'big-video-player': require('./BigVideoPlayer'),
    'free-playlist-ui': require('./FreePlaylistUI'),
    'tracks-download-ui': require('./TracksDownloadUI'),
    'downloads-ui': require('./DownloadsUI')
  },
  methods: {
    onLoadStart: function() {
      this.isReady = false;
      this.isError = false;
      this.isLoading = true;
    },
    onLoadSuccess: function() {
      this.isReady = true;
      this.isError = false;
      this.isLoading = false;
    },
    onLoadError: function() {
      this.isReady = false;
      this.isError = true;
      this.isLoading = false;
    },
    onPlaylistSelected: function(playlist) {
      try {
        this.isFreePlaylist = playlist.free;
        this.isDownloadlist = playlist.download;
      }
      catch (e) {
      }
    }
  }
});

module.exports = MiniPlayer;
