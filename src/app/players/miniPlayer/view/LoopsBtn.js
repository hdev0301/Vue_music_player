var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');
var urlBuilder = require('../../common/urlBuilder');

var LoopsBtn = Vue.extend({
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
  name: ComponentName.LOOPS_BTN,
  ready: function() {
    var actions = this.getActions();
    this.listenTo(actions.onTrackChanged, this.onTrackChanged);
  },
  template: require('../tpl/loops-btn.tpl.html'),
  replace: true,
  data: function() {
    return {
      track: {}
    };
  },
  methods: {
    onTrackChanged: function(track) {
      this.track = track || {};
    }
  },
  filters: {
    'href': function(track) {
      try {
        return urlBuilder.longoLoops(track.sources[0]);
      }
      catch (e) {
      }
      return '';
    }
  }
});

module.exports = LoopsBtn;
