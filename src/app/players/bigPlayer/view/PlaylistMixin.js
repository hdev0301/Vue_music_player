var Reflux = require('reflux');
var IScroll = require('iscroll');

function formatTime(time) {
  if (isNaN(time)) {
    time = 0;
  }
  var minutes = Math.floor(time / 60);
  var seconds = Math.floor(time - minutes * 60).toString();
  while (seconds.length < 2) {
    seconds = '0' + seconds;
  }
  return minutes + ':' + seconds;
}

function formatIndex(index) {
  var str = (index + 1).toString();
  while (str.length < 2) {
    str = '0' + str;
  }
  return str;
}

function renderTracks(root, tracks) {
  root.innerHTML = tracks.map(function(track, index) {
    return [
      '<li class="track" track-id="' + track.id + '">',
      '<span class="track__index">' + formatIndex(index) + '</span>',
      '<span class="track__title">' + track.title + '</span>',
      '<span class="track__time">' + formatTime(track.duration) + '</span>',
      '</li>'
    ].join('');
  }).join('');
}

function updateTracksNodes(vm) {
  var nodes = vm.$el.querySelectorAll('.track');
  nodes = Array.prototype.slice.call(nodes);

  var className;
  var trackId;
  nodes.forEach(function(node) {
    trackId = node.getAttribute('track-id');
    trackId = vm.map[trackId].id;

    className = ['track'];

    if (vm.activeTrack.id === trackId) {
      className.push('track--active');
    }

    if (vm.markFavorite === true) {
      if (vm.favIds.indexOf(trackId) > -1) {
        className.push('track--fav');
      }
    }

    node.className = className.join(' ');
  });
}

function isTrackNode(el) {
  return el.className.match(/\btrack\b/);
}

function handleClick(event, vm) {
  var root = vm.$el;
  var el = event.target;

  var trackId;
  while (el !== root) {
    if (isTrackNode(el)) {
      trackId = el.getAttribute('track-id');
      vm.getActions().changeTrack(vm.map[trackId]);
      break;
    }

    el = el.parentNode;
  }
}

function scrollToTrack(vm) {
  if (vm.activeTrack === null || typeof vm.activeTrack === 'undefined') {
    return;
  }

  var selector = '[track-id="' + vm.activeTrack.id + '"]';
  var el = vm.$el.querySelector(selector);
  if (el === null) {
    return;
  }
  var elRect = el.getBoundingClientRect();
  var viewPortRect = vm.$el.getBoundingClientRect();
  var isVisible = elRect.top >= viewPortRect.top && elRect.bottom <= viewPortRect.bottom;

  if (isVisible) {
    return;
  }
  vm.scroller.refresh();
  setTimeout(function() {
    vm.scroller.scrollToElement(el, null, null, true);
  });
}

function addClassName(el, className) {
  var parts = el.className.split(' ');
  if (parts.indexOf(className) > -1) {
    return;
  }
  parts.push(className);
  el.className = parts.join(' ');
}

function removeClassName(el, className) {
  var parts = el.className.split(' ');
  var index = parts.indexOf(className);
  if (index === -1) {
    return;
  }
  parts.splice(index, 1);
  el.className = parts.join(' ');
}

function refreshScroller(vm) {
  vm.scroller.refresh();

  if (vm.scroller.hasVerticalScroll) {
    addClassName(vm.$el, 'tracks-list--with-scroll');
  } else {
    removeClassName(vm.$el, 'tracks-list--with-scroll');
  }
}

function processNewTracks(vm) {
  vm.favIds = [];
  vm.map = {};
  vm.tracks.forEach(function(track) {
    if (track.favorite === true) {
      vm.favIds.push(track.id);
    }

    vm.map[track.id] = track;
  });

  renderTracks(vm.$el.querySelector('ul'), vm.tracks);
  updateTracksNodes(vm);

  refreshScroller(vm);
  scrollToTrack(vm);

  setTimeout(function() {
    refreshScroller(vm);
    scrollToTrack(vm);
  });
}

module.exports = {
  mixin: {
    replace: true,
    actionsFactory: function() {
      return {
        onTracksChanged: Reflux.createAction({
          sync: true
        }),
        onActiveTrackChanged: Reflux.createAction({
          sync: true
        }),
        onTrackAddedToFavs: Reflux.createAction({
          sync: true
        }),
        changeTrack: Reflux.createAction({
          sync: true
        })
      };
    },
    ready: function() {
      var actions = this.getActions();
      this.listenTo(actions.onTracksChanged, this.onTracksChanged);
      this.listenTo(actions.onActiveTrackChanged, this.onActiveTrackChanged);
      this.listenTo(actions.onTrackAddedToFavs, this.onTrackAddedToFavs);

      this.scroller = new IScroll(this.$el, {
        mouseWheel: true,
        tap: true,
        scrollbars: true,
        interactiveScrollbars: true
      });

      processNewTracks(this);
    },
    beforeDestroy: function() {
      this.scroller.destroy();
      this.scroller = null;
    },
    data: function() {
      return {
        tracks: [],
        map: {},
        activeTrack: {},
        favIds: []
      };
    },
    methods: {
      onTracksChanged: function(tracks) {
        this.tracks = tracks;
        processNewTracks(this);
      },
      onActiveTrackChanged: function(activeTrack) {
        this.activeTrack = activeTrack || {};
        updateTracksNodes(this);
        scrollToTrack(this);
      },
      onTrackAddedToFavs: function(track) {
        this.favIds.push(track.id);
        updateTracksNodes(this);
      },
      onClick: function(event) {
        event.preventDefault();
        handleClick(event, this);
      }
    }
  }
};
