var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');

var TabsList = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  actionsFactory: function() {
    return {
      onPlaylistsChanged: Reflux.createAction({
        sync: true
      }),
      onPlaylistSelected: Reflux.createAction({
        sync: true
      }),
      change: Reflux.createAction({
        sync: true
      })
    };
  },
  name: ComponentName.TABS,
  ready: function() {
    var actions = this.getActions();
    this.listenTo(actions.onPlaylistsChanged, this.onPlaylistsChanged);
    this.listenTo(actions.onPlaylistSelected, this.onPlaylistSelected);
  },
  data: function() {
    return {
      playlists: [],
      selected: -1
    };
  },
  template: require('../tpl/tabs-list.tpl.html'),
  replace: true,
  methods: {
    onPlaylistsChanged: function(playlists) {
      this.playlists = playlists;
    },
    onPlaylistSelected: function(index) {
      this.selected = index;
    },
    changePlaylist: function(event, index) {
      event.preventDefault();
      this.getActions().change(index);
    }
  }
});

module.exports = TabsList;
