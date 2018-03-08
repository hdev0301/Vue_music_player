var Vue = require('vue');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');

var BigVideoPlayer = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  name: ComponentName.BIG_VIDEO_PLAYER,
  created: function() {
    var playFile;
    var volumeBar;
    var progressBar;
    var videoTime;
    var that = this;

    window.addEventListener('onVideoAdded', function(e) {
      var vPlayer = document.getElementById('player');
      vPlayer.className = 'big-video-player display';
      if (!sessionStorage.autoplaySupported) {
        that.deferStateSwitching({
          isPlaying: true
        });
      }
      playFile = e.detail.file;
      var type = playFile.type;
      var videoNode = document.querySelector('video');
      var canPlay = videoNode.canPlayType(type);
      if (canPlay === '') {
        canPlay = 'no';
      }
      var isError = canPlay === 'no';
      var unsupportView = document.querySelector('#video-unsupport');
      var videoView = document.querySelector('#video-player');
      var leftTrimBar = document.querySelector('#trim-left');
      var rightTrimBar = document.querySelector('#trim-right');
      that.dragElement(videoView, true, true);
      that.dragElement(leftTrimBar, true, false);
      that.dragElement(rightTrimBar, true, false);
      unsupportView.className = (isError) ? 'video-unsupport display' : 'video-unsupport none';
      videoView.className = (isError) ? 'none' : 'display';

      if (isError) {
        return;
      }

      var URL = window.URL || window.webkitURL;
      var fileUrl = URL.createObjectURL(playFile);
      videoNode.src = fileUrl;

      volumeBar = document.querySelector('#volume-bar');
      volumeBar.addEventListener('change', function(event) {
        videoView.volume = event.target.value;
      }, false);
      progressBar = document.querySelector('#video-progress');
      progressBar.addEventListener('click', function(event) {
        var percent = event.offsetX / this.offsetWidth;
        videoView.currentTime = percent * videoView.duration;
        event.target.value = Math.floor(percent / 100);
      });
      videoView.addEventListener('timeupdate', function() {
        var percentage = Math.floor((100 / videoView.duration) * videoView.currentTime);
        var vLen = Math.floor(videoView.duration);
        var vCurrent = Math.floor(videoView.currentTime);
        var vLenSec = ((vLen % 60) < 10) ? ('0' + (vLen % 60)) : (vLen % 60);
        var vCurrentSec = ((vCurrent % 60) < 10) ? ('0' + (vCurrent % 60)) : (vCurrent % 60);
        that.videoLength = Math.floor(vLen / 60) + ':' + vLenSec;
        that.videoCurrentTime = Math.floor(vCurrent / 60) + ':' + vCurrentSec;
        videoTime = document.querySelector('#video-time');
        videoTime.innerHTML = that.videoCurrentTime + '/' + that.videoLength;
        if (progressBar && percentage) {
          progressBar.value = percentage;
        }
      }, false);
      var volumeBox = document.querySelector('#volume-box');
      volumeBox.addEventListener('mouseover', function() {
        volumeBar.className = 'volume-bar';
      }, false);
      volumeBox.addEventListener('mouseout', function() {
        if (!that.isKeepVolumeBar) {
          volumeBar.className = 'volume-bar none';
        }
      });
      volumeBar.addEventListener('mouseover', function() {
        volumeBar.className = 'volume-bar';
      });
      volumeBar.addEventListener('mousedown', function() {
        that.isKeepVolumeBar = true;
      });
      videoView.addEventListener('mousedown', function() {
        that.isKeepVolumeBar = false;
        volumeBar.className = 'volume-bar none';
      });
    }, false);
  },
  ready: function() {
  },
  beforeDestroy: function() {
    window.removeEventListener('onVideoAdded', function(e) {
      console.log(e);
    });
  },
  data: function() {
    return {
      videoAdded: false,
      videoLength: 0,
      videoCurrentTime: 0,
      isPlaying: true,
      isMute: false,
      pos1: 0,
      pos2: 0,
      pos3: 0,
      pos4: 0,
      pos5: 0,
      pos6: 0,
      pos7: 0,
      pos8: 0,
      isKeepVolumeBar: false,
      isDisplayVolumeBar: false
    };
  },
  template: require('../tpl/big-video-player.tpl.html'),
  methods: {
    onPlay: function(e) {
      this.deferStateSwitching({
        isPlaying: true
      });
      e.preventDefault();
      this.playPause(e);
    },
    onPause: function(e) {
      this.deferStateSwitching({
        isPlaying: false
      });
      e.preventDefault();
      this.playPause(e);
    },
    playPause: function(e) {
      var player = document.getElementById('video-player');
      if (player.paused || player.ended) {
        player.play();
      } else {
        player.pause();
      }
      e.preventDefault();
    },
    triggerMute: function(e) {
      e.preventDefault();
      var player = document.getElementById('video-player');
      if (player.muted) {
        player.muted = false;
      } else {
        player.muted = true;
      }
    },
    onTriggerPlay:  function(e) {
      e.preventDefault();
      this.deferStateSwitching({
        isPlaying: !this.isPlaying
      });
      this.playPause(e);
    },
    onTriggerVolume: function(e) {
      e.preventDefault();
      this.deferStateSwitching({
        isMute: !this.isMute
      });
      this.triggerMute();
    },
    onClose: function(e) {
      e.preventDefault();
      var vPlayer = document.getElementById('player');
      vPlayer.className = 'big-video-player none';
      var videoNode = document.querySelector('video');
      videoNode.pause();
      this.deferStateSwitching({
        isPlaying: true
      });
      videoNode.src = '';
      videoNode.load();
      window.removeEventListener('onVideoAdded', function(e) {
        console.log(e);
      });
      var closeVideoEvent;
      closeVideoEvent = new CustomEvent('onVideoClosed');
      window.dispatchEvent(closeVideoEvent);
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
    dragElement: function(element, horizontal, vertical) {
      if (horizontal && vertical) {
        element.onmousedown = this.dragMouseDown;
      }
      if (horizontal && !vertical) {
        if (element.id === 'trim-left') {
          element.onmousedown = this.dragLeftMouseDown;
        } else {
          element.onmousedown = this.dragRightMouseDown;
        }
      }
    },
    dragMouseDown: function(e) {
      e = e || window.event;
      this.pos3 = e.clientX;
      this.pos4 = e.clientY;
      document.onmouseup = this.closeDragElement;
      document.onmousemove = this.elementDrag;
    },
    dragLeftMouseDown: function(e) {
      e = e || window.event;
      this.pos6 = e.clientX;
      document.onmouseup = this.closeDragElement;
      document.onmousemove = this.leftElementDrag;
    },
    dragRightMouseDown: function(e) {
      e = e || window.event;
      this.pos8 = e.clientX;
      document.onmouseup = this.closeDragElement;
      document.onmousemove = this.rightElementDrag;
    },
    elementDrag: function(e) {
      var toDragElement = document.getElementById('player');
      e = e || window.event;
      this.pos1 = this.pos3 - e.clientX;
      this.pos2 = this.pos4 - e.clientY;
      this.pos3 = e.clientX;
      this.pos4 = e.clientY;
      toDragElement.style.top = (toDragElement.offsetTop - this.pos2) + 'px';
      toDragElement.style.left = (toDragElement.offsetLeft - this.pos1) + 'px';
    },
    leftElementDrag: function(e) {
      var toDragElement = document.getElementById('trim-left');
      e = e || window.event;
      this.pos5 = this.pos6 - e.clientX;
      this.pos6 = e.clientX;
      toDragElement.style.left = (toDragElement.offsetLeft - this.pos5) + 'px';
    },
    rightElementDrag: function(e) {
      var toDragElement = document.getElementById('trim-right');
      e = e || window.event;
      this.pos7 = this.pos8 - e.clientX;
      this.pos8 = e.clientX;
      toDragElement.style.left = (toDragElement.offsetLeft - this.pos7) + 'px';
    },
    closeDragElement: function() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
});

module.exports = BigVideoPlayer;
