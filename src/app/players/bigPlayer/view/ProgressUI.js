var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');
var DragArea = require('./DragArea');

var ProgressUI = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  actionsFactory: function() {
    return {
      onTrackChanged: Reflux.createAction({
        sync: true
      }),
      onDurationChanged: Reflux.createAction({
        sync: true
      }),
      onCurrentTimeChanged: Reflux.createAction({
        sync: true
      }),
      onLoad: Reflux.createAction({
        sync: true
      }),
      seek: Reflux.createAction()
    };
  },
  name: ComponentName.PROGRESS_UI,
  // created: function() {
  //   window.addEventListener('keydown', this.onKeyDown);
  //   window.addEventListener('keyup', this.onKeyUp);
  // },
  ready: function() {
    this.$on('leftkeydown', function() {
      // this.onKeyDown(e);
      this.currentTime -= 5;
      // var seekRatio = this.currentTime / this.duration;
      var seekRatio = this.currentTime / this.currentDuration;
      this.onDragEnd(seekRatio);
    });
    this.$on('rightkeydown', function() {
      // this.onKeyDown(e);
      this.currentTime += 5;
      // var seekRatio = this.currentTime / this.duration;
      var seekRatio = this.currentTime / this.currentDuration;
      this.onDragEnd(seekRatio);
    });
    var actions = this.getActions();
    this.listenTo(actions.onTrackChanged, this.onTrackChanged);
    this.listenTo(actions.onDurationChanged, this.onDurationChanged);
    this.listenTo(actions.onCurrentTimeChanged, this.onCurrentTimeChanged);
    this.listenTo(actions.onLoad, this.onLoad);

    this.dragArea = new DragArea(this.$el.querySelector('[data-drag-area]'));
    this.listenTo(this.dragArea.onStart, this.onDragStart);
    this.listenTo(this.dragArea.onDrag, this.onDrag);
    this.listenTo(this.dragArea.onEnd, this.onDragEnd);

    this.currentAvailableDurations = this.track.availableDurations;
    this.currentDuration = this.track.duration;
  },
  beforeDestroy: function() {
    this.dragArea.destroy();
    // window.removeEventListener('keydown', this.onKeyDown);
  },
  data: function() {
    return {
      track: null,
      hasTrack: false,
      duration: 0,
      currentTime: 0,
      bytesLoaded: 0,
      bytesTotal: 0,
      keys: [],
      originIndex: 0,
      currentDuration: 0,
      currentAvailableDurations: []
    };
  },
  template: require('../tpl/progress-ui.tpl.html'),
  replace: true,
  methods: {
    onTrackChanged: function(track) {
      this.track = track;
      this.hasTrack = this.track !== null;
      // this.currentAvailableDurations =
      // (this.hasTrack) ? this.track.availableDurations : [];
      // this.currentDuration = (this.hasTrack) ? track.duration : 0;
      var retrievedObject = localStorage.getItem('activeTracks');
      retrievedObject = JSON.parse(retrievedObject);
      var that = this;
      var selectedTrack;
      if (this.hasTrack) {
        selectedTrack = (retrievedObject) ? retrievedObject.filter(function(item) {
          return item.id === that.track.id;
        }) : [];
      } else {
        selectedTrack = retrievedObject[0];
      }
      this.currentAvailableDurations = (this.hasTrack && selectedTrack[0]) ? selectedTrack[0].availableDurations : [];
      this.currentDuration = (this.hasTrack && selectedTrack[0]) ? selectedTrack[0].duration : 0;
      this.originIndex = 0;
      this.onMainTrackChanged(-1);
    },
    onDurationChanged: function(duration) {
      this.duration = duration;
      this.currentDuration = duration;
    },
    onCurrentTimeChanged: function(currentTime) {
      this.currentTime = currentTime;
    },
    onLoad: function(bytesLoaded, bytesTotal) {
      this.bytesLoaded = bytesLoaded;
      this.bytesTotal = bytesTotal;
    },
    onDragStart: function() {
    },
    onDrag: function() {
    },
    onDragEnd: function(ratio) {
      this.getActions().seek(ratio);
    },
    onMainTrackChanged: function(index) {
      if (index === -1) {
        this.originIndex = 0;
      } else {
        if (this.originIndex === 0) {
          this.originIndex = index + 1;
        } else {
          if (this.originIndex === index + 1) {
            this.originIndex = 0;
          }
        }
      }
      if (index !== -1) {
        var temp = this.currentAvailableDurations[index];
        this.currentAvailableDurations[index] = this.currentDuration;
        this.currentAvailableDurations = Object.assign([], this.currentAvailableDurations);
        this.currentDuration = temp;
      }
      var event;
      if (this.originIndex === 0) {
        event = new CustomEvent('onActiveDurationChanged', {detail: {'duration': this.currentDuration, 'back': true}});
      } else {
        event = new CustomEvent('onActiveDurationChanged', {detail: {'duration': this.currentDuration, 'back': false}});
      }
      window.dispatchEvent(event);
    }
    // onKeyDown: function(e) {
    //   e.preventDefault();

    //   this.keys[e.keyCode] = true;

    //   if (this.keys[37]) {
    //     this.currentTime -= 5;
    //   } else if (this.keys[39]) {
    //     this.currentTime += 5;
    //   }
    //   var seekRatio = this.currentTime / this.duration;
    //   this.onDragEnd(seekRatio);
    // },
    // onKeyUp: function(e) {
    //   // this.keys[e.keyCode] = false;
    // }
  },
  computed: {
    availableDurations: function() {
      if (!this.hasTrack) {
        return [];
      } else {
        return this.track.availableDurations;
      }
    }
  },
  filters: {
    'wave-form-url': function(track) {
      var regExp = /([^\/]+)\.[^.]+$/;
      try {
        var fileName = regExp.exec(track.sources[0])[1];
        fileName = fileName.replace(/^preview-/gi, '');
        if (this.currentAvailableDurations.length === 0) {
          return '/i/wav/' + fileName + '.png';
        } else {
          return '/i/wav/' + fileName + '-' + this.currentDuration + '.png';
        }
      }
      catch (e) {
      }
      return '';
    },
    'percent': function(value) {
      if (isNaN(value)) {
        return 0;
      }
      return Math.min((value * 100), 100) + '%';
    },
    'time': function(value) {
      value = parseFloat(value);
      if (isNaN(value)) {
        value = 0;
      }
      var minutes = Math.floor(value / 60);
      var seconds = (Math.floor(value - minutes * 60)).toString();
      while (seconds.length < 2) {
        seconds = '0' + seconds;
      }
      return minutes + ':' + seconds;
    }
  }
});

module.exports = ProgressUI;
