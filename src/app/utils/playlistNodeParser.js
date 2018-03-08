var helpers = require('./helpers');
var trackNodeParser = require('./trackNodeParser');

module.exports = {
  parse: function(playlistNode) {
    var value;
    var playlist = {};

    playlist.title = helpers.getAttribute(playlistNode, 'title') || '';

    playlist.url = helpers.getAttribute(playlistNode, 'playlist') || '';

    value = helpers.getAttribute(playlistNode, 'active');
    playlist.active = value === 'true' || value === '1';

    value = helpers.getAttribute(playlistNode, 'free');
    playlist.free = value === 'true' || value === '1';

    value = helpers.getAttribute(playlistNode, 'download');
    playlist.download = value === 'true' || value === '1';

    var trackNodes = playlistNode.querySelectorAll('[track],[data-track]');
    trackNodes = Array.prototype.slice.call(trackNodes);

    playlist.tracks = trackNodes.map(function(trackNode) {
      return trackNodeParser.parse(trackNode);
    });

    return playlist;
  }
};
