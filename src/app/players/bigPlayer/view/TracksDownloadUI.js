var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');
var urlBuilder = require('../../common/urlBuilder');

var TracksDownloadUI = Vue.extend({
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
  name: ComponentName.TRACKS_DOWNLOAD_UI,
  ready: function() {
    var actions = this.getActions();
    this.listenTo(actions.onTrackChanged, this.onTrackChanged);
  },
  data: function() {
    return {
      track: null,
      isEmpty: true,
      fileType: ''
    };
  },
  template: require('../tpl/tracks-download-ui.tpl.html'),
  replace: true,
  methods: {
    onTrackChanged: function(track) {
      this.track = track;
      this.isEmpty = track === null;
    },
    onTypeSelected: function(fileType) {
      this.fileType = fileType;
    }
  },
  filters: {
    'download-url': function(track) {
      try {
        return urlBuilder.downloadTrack(track.sources[0], this.fileType);
      }
      catch (e) {
        return '';
      }
    }
  }
});

module.exports = TracksDownloadUI;
