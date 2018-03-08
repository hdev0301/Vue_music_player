var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');
var videoUrl = require('../stores/videoUrl');

var VIDEO_URL = 'videoURL';

var VideoUI = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  actionsFactory: function() {
    return {
      addVideo: Reflux.createAction({
        sync: true
      })
    };
  },
  name: ComponentName.VIDEO_UI,
  ready: function() {
  },
  data: function() {
    return {
      active: false
    };
  },
  template: require('../tpl/video-ui.tpl.html'),
  replace: true,
  methods: {
    onVideoAddClicked: function(event) {
      event.preventDefault();
      document.getElementById('fileInput').click();
    },
    onFileClicked: function(event) {
      // event.preventDefault();
      this.chooseFile(event);
    },
    onFileChanged: function(event) {
      event.preventDefault();
      this.chooseFile(event);
    },
    chooseFile: function(event) {
      var files = event.target.files || event.dataTransfer.files;
      if (!files.length) {
        return;
      }
      videoUrl.set(VIDEO_URL, files[0]);
      var addVideoEvent;
      addVideoEvent = new CustomEvent('onVideoAdded', {detail: {'file': files[0]}});
      window.dispatchEvent(addVideoEvent);
    }
  }
});

module.exports = VideoUI;
