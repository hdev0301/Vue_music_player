module.exports = {
  longoLoops: function(soundFileUrl) {
    var url = '';
    var regExp = /([^\/]+)\.[^\.]+$/gi;
    try {
      var fileName = regExp.exec(soundFileUrl)[1];
      fileName = fileName.replace(/^preview-/gi, '');
      url = '/my-music/longoloops/' + fileName + '/';
    }
    catch (e) {
    }
    return url;
  },
  download: function(soundFileUrl) {
    var url = '';
    var regExp = /([^\/]+)\.[^\.]+$/gi;
    try {
      var fileName = regExp.exec(soundFileUrl)[1];
      fileName = fileName.replace(/^preview-/gi, '');
      url = '/my-music/download/' + fileName + '/';
    }
    catch (e) {
    }
    return url;
  },
  downloadTrack: function(soundFileUrl, fileType) {
    var url = '';
    var regExp = /([^\/]+)\.[^\.]+$/gi;
    try {
      var fileName = regExp.exec(soundFileUrl)[1];
      fileName = fileName.replace(/^preview-/gi, '');
      switch (fileType) {
        case 'MP3':
          url = '/my-music/download/' + fileName + '-mp3' + '/';
          break;
        case 'WAV':
          url = '/my-music/download/' + fileName + '-wav' + '/';
          break;
        case 'AIFF':
          url = '/my-music/download/' + fileName + '-aiff' + '/';
          break;
        case 'License':
          url = '/my-music/tracks/' + fileName + '/';
          break;
        default:
          url = '/my-music/download/' + fileName + '/';
          break;
      }
    }
    catch (e) {
    }
    return url;
  },
  addToMyMusic: function(tracks) {
    tracks = tracks || [];
    tracks = Array.prototype.slice.call(tracks);
    var base = '/order/add-to-my-music/?id=';
    return base + tracks.map(function(track) {
        return track.id;
      }).join('+');
  },
  checkout: function(tracks) {
    tracks = tracks || [];
    tracks = Array.prototype.slice.call(tracks);
    var base = '/order/checkout/?id=';
    return base + tracks.map(function(track) {
        return track.id;
      }).join('+');
  },
  trackLink: function(track) {
    var regExp = /([^\/]+)\.[^\.]+$/gi;
    try {
      var arr = regExp.exec(track.sources[0]);
      return '/tracks/' + arr[1].replace(/^preview-/gi, '') + '/';
    }
    catch (e) {
    }
    return '';
  }
};
