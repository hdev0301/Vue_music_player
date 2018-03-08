var reqwest = require('reqwest');

var tracksCache = {};

function toXML(str) {
  if (window.DOMParser) {
    var parser = new DOMParser();
    return parser.parseFromString(str, 'text/xml');
  }

  var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
  xmlDoc.async = false;
  xmlDoc.loadXML(str);
  return xmlDoc;
}

function parse(xml) {
  var trackNodes = xml.querySelectorAll('track');
  trackNodes = Array.prototype.slice.call(trackNodes);

  return trackNodes.map(function(node) {
    var duration = parseInt(node.getAttribute('duration'));
    if (isNaN(duration)) {
      duration = 0;
    }

    var soundUrl = node.getAttribute('url');
    var sourceBaseRegExp = /(.+)\.[^\.]+$/gi;
    var arr = sourceBaseRegExp.exec(soundUrl);
    var sourceBase = '';
    if (Array.isArray(arr) && arr.length > 1) {
      sourceBase = arr[1];
    }

    var value = node.getAttribute('favs');
    var inFavs = value === 'true' || value === '1';

    var availableDurations = [];
    var rawAvailableDurations = node.getAttribute('ext');
    if (typeof rawAvailableDurations === 'string' && rawAvailableDurations.length > 0) {
      var regExp = /([0-9]+)/g;
      var res;

      do {
        res = regExp.exec(rawAvailableDurations);
        if (Array.isArray(res) && res.length >= 2) {
          availableDurations.push(parseInt(res[1], 10));
        }
      } while (res !== null);
    }

    return {
      id: node.getAttribute('id'),
      title: node.getAttribute('title'),
      duration: duration,
      sources: [
        sourceBase + '.ogg',
        sourceBase + '.mp3'
      ],
      favorite: inFavs,
      author: {
        name: node.getAttribute('cname'),
        url: node.getAttribute('curl')
      },
      availableDurations: availableDurations
    };
  });
}

function load(url, cb) {
  var cfg = {
    url: url,
    data: {
      _: Date.now()
    },
    type: 'text',
    success: function(xml) {
      xml = toXML(xml.responseText);
      try {
        cb(null, parse(xml));
      }
      catch (e) {
        cb(e);
      }
    },
    error: function(err) {
      cb(err);
    }
  };

  var xhr = reqwest(cfg);

  return function cancelRequest() {
    xhr.abort();
  };
}

function addToCache(url, tracks) {
  tracksCache[url] = tracks;
}

function removeFromCache(url) {
  delete tracksCache[url];
}

function getCachedTracks(url) {
  return tracksCache[url];
}

function hasCachedTracks(url) {
  return Array.isArray(getCachedTracks(url));
}

module.exports = {
  load: load,
  addToCache: addToCache,
  removeFromCache: removeFromCache,
  hasCachedTracks: hasCachedTracks,
  getCachedTracks: getCachedTracks
};
