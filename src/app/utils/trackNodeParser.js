var helpers = require('./helpers');

/**
 * Definition of "track node":
 *
 * <div track="{TRACK_ID}"
 *      duration="{TRACK_DURATION}"
 *      favs="{TRUE_OR_1}"
 *      title="{TRACK_TITLE}"
 *      author-name="{COMPOSER_NAME}"
 *      author-url="{COMPOSER_URL}"> *
 *   <audio>
 *     <source src="{OGG_SOUND_URL}"/>
 *     <source src="{MP3_SOUND_URL}"/>
 *   </audio>
 * </div>
 */

module.exports = {
  parse: function parseTrackNode(trackNode) {
    if (trackNode === null) {
      return null;
    }

    var value;
    var nodes;
    var track = {};

    // track id
    track.id = helpers.getAttribute(trackNode, 'track');

    // duration
    value = parseFloat(helpers.getAttribute(trackNode, 'duration'));
    if (isNaN(value)) {
      value = 0;
    }
    track.duration = value;

    // favorites
    value = helpers.getAttribute(trackNode, 'favs');
    track.favorite = value === '1' || value === 'true';

    // title
    track.title = helpers.getAttribute(trackNode, 'title') || '';

    // composer name
    var authorName = helpers.getAttribute(trackNode, 'c-name') || '';

    // composer url
    var authorUrl = helpers.getAttribute(trackNode, 'c-url') || '';

    var availableDurations = [];
    var rawAvailableDurations = helpers.getAttribute(trackNode, 'ext') || '';
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
    track.availableDurations = availableDurations;

    track.author = {
      name: authorName,
      url: authorUrl
    };

    // sources
    nodes = trackNode.querySelectorAll('audio source');
    nodes = Array.prototype.slice.call(nodes);
    track.sources = nodes.map(function(node) {
      return node.getAttribute('src');
    });

    return track;
  }
};
