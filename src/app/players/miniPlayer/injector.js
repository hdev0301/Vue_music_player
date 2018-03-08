var ComponentName = require('./view/ComponentName');

var MiniPlayerCtrl = require('./mediators/MiniPlayerCtrl');
var CartBtnCtrl = require('./mediators/CartBtnCtrl');
var FavsBtnCtrl = require('./mediators/FavsBtnCtrl');
var LoopsBtnCtrl = require('./mediators/LoopsBtnCtrl');
var PlaybackBtnCtrl = require('./mediators/PlaybackBtnCtrl');

module.exports = {
  inject: function(key, api) {
    switch (key) {
      case ComponentName.MINI_PLAYER:
        return new MiniPlayerCtrl(api);
      case ComponentName.CART_BTN:
        return new CartBtnCtrl(api);
      case ComponentName.FAVS_BTN:
        return new FavsBtnCtrl(api);
      case ComponentName.LOOPS_BTN:
        return new LoopsBtnCtrl(api);
      case ComponentName.PLAYBACK_BTN:
        return new PlaybackBtnCtrl(api);
    }
  }
};
