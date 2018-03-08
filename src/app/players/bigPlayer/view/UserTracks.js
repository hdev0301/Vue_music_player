var Vue = require('vue');
var BaseMixin = require('../../common/BaseMixin');
var PlaylistMixin = require('./PlaylistMixin');
var ComponentName = require('./ComponentName');

var UserTracks = Vue.extend({
  mixins: [
    BaseMixin.mixin,
    PlaylistMixin.mixin
  ],
  name: ComponentName.USER_TRACKS,
  template: require('../tpl/user-tracks.tpl.html'),
  data: function() {
    return {
      markFavorite: true
    };
  }
});

module.exports = UserTracks;

