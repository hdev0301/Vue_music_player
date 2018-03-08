var playlistNodeParser = require('./playlistNodeParser');
var helpers = require('./helpers');

module.exports = {
  parse: function(playerNode) {
    var value;
    var cfg = {};

    var playlistNodes = playerNode.querySelectorAll('[playlist],[data-playlist]');

    playlistNodes = Array.prototype.slice.call(playlistNodes);
    cfg.playlists = playlistNodes.map(function(node) {
      return playlistNodeParser.parse(node);
    });

    cfg.options = {};

    value = helpers.getAttribute(playerNode, 'autoplay');
    cfg.options.autoplay = value === 'true';

    value = parseInt(helpers.getAttribute(playerNode, 'downloads'), 10);
    if (isNaN(value)) {
      value = 0;
    }
    cfg.options.downloads = value;

    value = helpers.getAttribute(playerNode, 'force-html-audio');
    cfg.options.forceHtmlAudio = value === 'true';

    return cfg;
  }
};
