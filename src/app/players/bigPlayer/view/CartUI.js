var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');
var urlBuilder = require('../../common/urlBuilder');

var CartUI = Vue.extend({
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
  name: ComponentName.CART_UI,
  created: function() {
    /*window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);*/
  },
  ready: function() {
    var actions = this.getActions();
    this.listenTo(actions.onTracksChanged, this.onTracksChanged);
  },
  data: function() {
    return {
      tracks: {},
      keys: []
    };
  },
  template: require('../tpl/cart-ui.tpl.html'),
  replace: true,
  methods: {
    onTracksChanged: function(tracks) {
      this.tracks = tracks;
    },
    onKeyDown: function(e) {
      e.preventDefault();

      this.keys[e.keyCode] = true;

      if (this.keys[67]) {
        var checkoutUrl = urlBuilder.checkout(this.tracks);
        window.location.href = checkoutUrl;
      }
    },
    onKeyUp: function(e) {
      this.keys[e.keyCode] = false;
    }
  },
  filters: {
    'checkout-url': function(tracks) {
      return urlBuilder.checkout(tracks);
    },
    'tracks-count': function(tracks) {
      return tracks.length;
    }
  }
});

module.exports = CartUI;

