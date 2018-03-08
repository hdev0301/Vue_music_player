var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');
var urlBuilder = require('../../common/urlBuilder');

var TrackLink = Vue.extend({
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
  name: ComponentName.LINK,
  ready: function() {
    var actions = this.getActions();
    this.listenTo(actions.onTrackChanged, this.onTrackChanged);
  },
  data: function() {
    return {
      track: {}
    };
  },
  template: require('../tpl/track-link.tpl.html'),
  replace: true,
  methods: {
    onTrackChanged: function(track) {
      this.track = track;
    }
  },
  filters: {
    'title': function(track) {
      try {
        return track.title || '';
      }
      catch (e) {
      }
      return '';
    },
    'href': function(track) {
      return urlBuilder.trackLink(track);
    }
  }
});

module.exports = TrackLink;
