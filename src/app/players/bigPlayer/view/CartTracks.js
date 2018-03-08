var Vue = require('vue');
var BaseMixin = require('../../common/BaseMixin');
var PlaylistMixin = require('./PlaylistMixin');
var ComponentName = require('./ComponentName');

var CartTracks = Vue.extend({
  mixins: [
    BaseMixin.mixin,
    PlaylistMixin.mixin
  ],
  name: ComponentName.CART_TRACKS,
  template: require('../tpl/cart-tracks.tpl.html')
});

module.exports = CartTracks;
