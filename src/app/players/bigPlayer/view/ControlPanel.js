var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');
var PlusOneAnimation = require('../../common/PlusOneAnimation');
var urlBuilder = require('../../common/urlBuilder');

var ControlPanel = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  actionsFactory: function() {
    return {
      play: Reflux.createAction(),
      pause: Reflux.createAction(),
      prevTrack: Reflux.createAction(),
      nextTrack: Reflux.createAction(),
      addToCart: Reflux.createAction(),
      delFromCart: Reflux.createAction(),
      addToFavs: Reflux.createAction(),
      onTrackChanged: Reflux.createAction({
        sync: false
      }),
      onPlay: Reflux.createAction({
        sync: false
      }),
      onPause: Reflux.createAction({
        sync: false
      }),
      onInCart: Reflux.createAction({
        sync: false
      }),
      onOutCart: Reflux.createAction({
        sync: false
      })
    };
  },
  name: ComponentName.CONTROL_PANEL,
  created: function() {
    /*window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);*/
  },
  ready: function() {
    var actions = this.getActions();
    this.listenTo(actions.onTrackChanged, this.onTrackChanged);
    this.listenTo(actions.onPlay, this.onPlay);
    this.listenTo(actions.onPause, this.onPause);
    this.listenTo(actions.onInCart, this.onInCart);
    this.listenTo(actions.onOutCart, this.onOutCart);

    this.plusOneAnimation = new PlusOneAnimation(this.$el.querySelector('[data-role="favs-btn"]'));
  },
  beforeDestroy: function() {
    if (typeof this._deferTimeout !== 'undefined' || this._deferTimeout !== null) {
      clearTimeout(this._deferTimeout);
    }
    this.plusOneAnimation.destroy();
    this.plusOneAnimation = null;
    window.removeEventListener('keydown', this.onKeyDown);
  },
  data: function() {
    return {
      track: {},
      isPlaying: false,
      inCart: false,
      keys: []
    };
  },
  template: require('../tpl/control-panel.tpl.html'),
  replace: true,
  methods: {
    onTrackChanged: function(track) {
      this.track = track;
    },
    onPlay: function() {
      this.deferStateSwitching({
        isPlaying: true
      });
    },
    onPause: function() {
      this.deferStateSwitching({
        isPlaying: false
      });
    },
    onInCart: function() {
      this.inCart = true;
    },
    onOutCart: function() {
      this.inCart = false;
    },
    play: function(event) {
      event.preventDefault();
      this.getActions().play();
    },
    pause: function(event) {
      event.preventDefault();
      this.getActions().pause();
    },
    prevTrack: function(event) {
      event.preventDefault();
      this.getActions().prevTrack();
    },
    nextTrack: function(event) {
      event.preventDefault();
      this.getActions().nextTrack();
    },
    addToCart: function(event) {
      event.preventDefault();
      this.getActions().addToCart();
    },
    delFromCart: function(event) {
      event.preventDefault();
      this.getActions().delFromCart();
    },
    addToFavs: function(event) {
      event.preventDefault();
      this.getActions().addToFavs();
      this.plusOneAnimation.show();
    },
    deferStateSwitching: function(state) {
      if (typeof this._deferredState === 'undefined') {
        this._deferredState = {};
      }
      state = state || {};
      var key;
      for (key in state) {
        if (!state.hasOwnProperty(key)) {
          continue;
        }
        this._deferredState[key] = state[key];
      }

      if (typeof this._deferTimeout === 'undefined' || this._deferTimeout === null) {
        this._deferTimeout = setTimeout(function() {
          this._deferTimeout = null;
          for (key in this._deferredState) {
            if (!this._deferredState.hasOwnProperty(key)) {
              continue;
            }
            this[key] = this._deferredState[key];
          }
          this._deferredState = {};
        }.bind(this), 30);
      }
    },
    onKeyDown: function(e) {
      e.preventDefault();

      this.keys[e.keyCode] = true;

      if (this.keys[38]) {
        this.prevTrack(e);
      } else if (this.keys[40]) {
        this.nextTrack(e);
      } else if (this.keys[32]) {  // Space for play/pause
        if (this.isPlaying === true) {
          this.pause(e);
        } else {
          this.play(e);
        }
      } else if (this.keys[65]) { // A for adding cart
        this.addToCart(e);
      } else if (this.keys[82]) { // R for removing cart
        this.delFromCart(e);
      } else if (this.keys[70]) { // F for adding favorites
        this.addToFavs(e);
      } else if (this.keys[76]) { // L for longoloops
        var longoLoopsUrl = urlBuilder.longoLoops(this.track.sources[0]);
        window.location.href = longoLoopsUrl;
      } else if (this.keys[37]) {
        this.$parent.$emit('leftkeydown', e);
      } else if (this.keys[39]) {
        this.$parent.$emit('rightkeydown', e);
      }
    },
    onKeyUp: function(e) {
      this.keys[e.keyCode] = false;
    }
  },
  filters: {
    'longoloops-href': function(track) {
      try {
        return urlBuilder.longoLoops(track.sources[0]);
      }
      catch (e) {
      }
      return '';
    }
  }
});

module.exports = ControlPanel;
