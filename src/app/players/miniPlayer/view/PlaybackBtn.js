var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');

var PlaybackBtn = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  actionsFactory: function() {
    return {
      play: Reflux.createAction({
        sync: true
      }),
      onPlay: Reflux.createAction({
        sync: true
      }),
      pause: Reflux.createAction({
        sync: true
      }),
      onPause: Reflux.createAction({
        sync: true
      }),
      onCurrentTimeChanged: Reflux.createAction({
        sync: true
      }),
      onDurationChanged: Reflux.createAction({
        sync: true
      })
    };
  },
  name: ComponentName.PLAYBACK_BTN,
  ready: function() {
    var actions = this.getActions();
    this.listenTo(actions.onPlay, this.onPlay);
    this.listenTo(actions.onPause, this.onPause);
    this.listenTo(actions.onCurrentTimeChanged, this.onCurrentTimeChanged);
    this.listenTo(actions.onDurationChanged, this.onDurationChanged);
  },
  template: require('../tpl/playback-btn.tpl.html'),
  replace: true,
  data: function() {
    return {
      playing: false,
      currentTime: 0,
      duration: 0
    };
  },
  methods: {
    onPlay: function() {
      this.playing = true;
    },
    onPause: function() {
      this.playing = false;
    },
    onCurrentTimeChanged: function(currentTime) {
      this.currentTime = currentTime;
    },
    onDurationChanged: function(duration) {
      this.duration = duration;
    },
    play: function(event) {
      event.preventDefault();
      this.getActions().play();
    },
    pause: function(event) {
      event.preventDefault();
      this.getActions().pause();
    }
  },
  filters: {
    'percent': function(value) {
      if (isNaN(value)) {
        return 0;
      }
      return (value * 100) + '%';
    }
  }
});

module.exports = PlaybackBtn;
