var favoriteTracks = require('../favoriteTracks/favoriteTracks');

module.exports = function FavoriteTracksCounter(el) {
  favoriteTracks.onCountChange(function() {
    el.innerHTML = favoriteTracks.getCount();
  });
};
