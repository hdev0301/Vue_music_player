var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');
var urlBuilder = require('../../common/urlBuilder');

var FreePlaylistUI = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  actionsFactory: function() {
    return {
      onTrackChanged: Reflux.createAction({
        sync: true
      })
    };
  },
  name: ComponentName.FREE_PLAYLIST_UI,
  ready: function() {
    var actions = this.getActions();
    this.listenTo(actions.onTrackChanged, this.onTrackChanged);
  },
  data: function() {
    return {
      track: null,
      isEmpty: true
    };
  },
  template: require('../tpl/free-playlist-ui.tpl.html'),
  replace: true,
  methods: {
    onTrackChanged: function(track) {
      this.track = track;
      this.isEmpty = track === null;
    }
  },
  filters: {
    'download-url': function(track) {
      try {
        return urlBuilder.download(track.sources[0]);
      }
      catch (e) {
        return '';
      }
    }
  }
});

module.exports = FreePlaylistUI;
