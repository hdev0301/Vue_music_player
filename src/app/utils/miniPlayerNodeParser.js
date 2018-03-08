var helpers = require('./helpers');
var trackNodeParser = require('./trackNodeParser');

/**
 * Definition of "mini player node":
 *
 * <div mini-player autoplay="{TRUE}">
 *   <track-node></track-node>
 * </div>
 */

module.exports = {
  parse: function(playerNode) {
    var value;
    var options = {};

    value = helpers.getAttribute(playerNode, 'autoplay');
    options.autoplay = value === 'true';

    return {
      el: playerNode,
      track: trackNodeParser.parse(playerNode.querySelector('[track],[data-track]')),
      options: options
    };
  }
};
