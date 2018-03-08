var bootstrap = require('./utils/bootstrap');
var bigPlayer = require('./players/bigPlayer');

bootstrap.bootstrap();

module.exports = {
  miniPlayer: require('./players/miniPlayer'),
  cart: require('./cart'),
  favs: require('./favoriteTracks'),
  utils: require('./utils'),
  config: require('./misc/config').config,
  createBigPlayer: bootstrap.createBigPlayer,
  loadPlaylist: function(playerID, url)  {
    bigPlayer.loadPlaylist(playerID, url);
  },
  onDomReady: bootstrap.onDomReady
};
