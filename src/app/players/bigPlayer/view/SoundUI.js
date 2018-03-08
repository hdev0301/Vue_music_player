var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');
var DragArea = require('./DragArea');

var SoundUI = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  actionsFactory: function() {
    return {
      changeVolume: Reflux.createAction({
        sync: true
      }),
      onVolumeChanged: Reflux.createAction({
        sync: true
      }),
      mute: Reflux.createAction({
        sync: true
      }),
      unmute: Reflux.createAction({
        sync: true
      }),
      onMuted: Reflux.createAction({
        sync: true
      }),
      onUnMuted: Reflux.createAction({
        sync: true
      })
    };
  },
  name: ComponentName.SOUND_UI,
  ready: function() {
    var actions = this.getActions();
    this.listenTo(actions.onVolumeChanged, this.onVolumeChanged);
    this.listenTo(actions.onMuted, this.onMuted);
    this.listenTo(actions.onUnMuted, this.onUnMuted);

    this.dragArea = new DragArea(this.$el.querySelector('[data-drag-area]'));
    this.listenTo(this.dragArea.onStart, this.onDragArea);
    this.listenTo(this.dragArea.onDrag, this.onDragArea);
    this.listenTo(this.dragArea.onEnd, this.onDragArea);
  },
  beforeDestroy: function() {
    this.dragArea.destroy();
  },
  data: function() {
    return {
      volume: 1,
      muted: false
    };
  },
  template: require('../tpl/sound-ui.tpl.html'),
  replace: true,
  methods: {
    onVolumeChanged: function(volume) {
      this.volume = volume;
    },
    onMuted: function() {
      this.muted = true;
    },
    onUnMuted: function() {
      this.muted = false;
    },
    onDragArea: function(ratio) {
      this.getActions().changeVolume(ratio);
    },
    mute: function(event) {
      event.preventDefault();
      this.getActions().mute();
    },
    unmute: function(event) {
      event.preventDefault();
      this.getActions().unmute();
    }
  }
});

module.exports = SoundUI;

