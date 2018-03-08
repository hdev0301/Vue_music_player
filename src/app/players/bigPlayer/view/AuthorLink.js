var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');

var AuthorLink = Vue.extend({
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
  template: require('../tpl/author-link.tpl.html'),
  replace: true,
  methods: {
    onTrackChanged: function(track) {
      this.track = track;
    }
  },
  filters: {
    'title': function(track) {
      try {
        return track.author.name || '';
      }
      catch (e) {
      }
      return '';
    },
    'href': function(track) {
      try {
        return '/composers/' + (track.author.url || '') + '/';
      }
      catch (e) {
      }
      return '#';
    }
  }
});

module.exports = AuthorLink;
