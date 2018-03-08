var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');
var urlBuilder = require('../../common/urlBuilder');

var DownloadsUI = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  actionsFactory: function() {
    return {
      onTracksChanged: Reflux.createAction({
        sync: true
      })
    };
  },
  name: ComponentName.DOWNLOADS_UI,
  ready: function() {
    var actions = this.getActions();
    this.listenTo(actions.onTracksChanged, this.onTracksChanged);
  },
  data: function() {
    return {
      tracks: {},
      downloads: 0
    };
  },
  template: require('../tpl/downloads-ui.tpl.html'),
  replace: true,
  methods: {
    onTracksChanged: function(tracks) {
      this.tracks = tracks;
    }
  },
  filters: {
    'url': function(tracks) {
      return urlBuilder.addToMyMusic(tracks);
    },
    'tracks-count': function(tracks) {
      return tracks.length;
    }
  }
});

module.exports = DownloadsUI;

