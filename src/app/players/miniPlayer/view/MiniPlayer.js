var Vue = require('vue');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');

var MiniPlayer = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  name: ComponentName.MINI_PLAYER,
  replace: true,
  template: require('../tpl/mini-player.tpl.html'),
  components: {
    'cart-btn': require('./CartBtn'),
    'playback-btn': require('./PlaybackBtn'),
    'favs-btn': require('./FavsBtn'),
    'loops-btn': require('./LoopsBtn')
  }
});

module.exports = MiniPlayer;
