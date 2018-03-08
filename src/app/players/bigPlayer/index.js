var PlayerContext = require('./PlayerContext');
var view = require('./view');

var BaseMixin = require('../common/BaseMixin');
var injector = require('./injector');
BaseMixin.onComponentReady(injector.inject);

var map = {};

module.exports = {
  create: function(el, playlists, options) {
    var contextId = PlayerContext.create(playlists, options);
    map[contextId] = {
      contextId: contextId,
      view: view.create(el, contextId)
    };
    return contextId;
  },
  destroy: function() {

  },
  loadPlaylist: function(playerID, url) {
    var context = PlayerContext.get(playerID);
    var userTracks = context.userTracks;
    if (typeof userTracks === 'undefined') {
      throw new Error('loadPlaylist:: unknown player id "' + playerID + '"');
    }
    userTracks.update({
      url: url
    });
  }
};
