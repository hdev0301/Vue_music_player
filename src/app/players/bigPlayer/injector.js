var ComponentName = require('./view/ComponentName');

var BigPlayerCtrl = require('./mediators/BigPlayerCtrl');
var TabsListCtrl = require('./mediators/TabsListCtrl');
var UserTracksCtrl = require('./mediators/UserTracksCtrl');
var CartTracksCtrl = require('./mediators/CartTracksCtrl');
var LinkCtrl = require('./mediators/LinkCtrl');
var ControlPanelCtrl = require('./mediators/ControlPanelCtrl');
var CartUICtrl = require('./mediators/CartUICtrl');
var ProgressUICtrl = require('./mediators/ProgressUICtrl');
var CycleUICtrl = require('./mediators/CycleUICtrl');
var SoundUICtrl = require('./mediators/SoundUICtrl');
var FreePlaylistUICtrl = require('./mediators/FreePlaylistUICtrl');
var TracksDownloadUICtrl = require('./mediators/TracksDownloadUICtrl');
var DownloadsUICtrl = require('./mediators/DownloadsUICtrl');

module.exports = {
  inject: function(key, api) {
    switch (key) {
      case ComponentName.BIG_PLAYER:
        return new BigPlayerCtrl(api);
      case ComponentName.TABS:
        return new TabsListCtrl(api);
      case ComponentName.USER_TRACKS:
        return new UserTracksCtrl(api);
      case ComponentName.CART_TRACKS:
        return new CartTracksCtrl(api);
      case ComponentName.LINK:
        return new LinkCtrl(api);
      case ComponentName.CONTROL_PANEL:
        return new ControlPanelCtrl(api);
      case ComponentName.CART_UI:
        return new CartUICtrl(api);
      case ComponentName.PROGRESS_UI:
        return new ProgressUICtrl(api);
      case ComponentName.CYCLE_UI:
        return new CycleUICtrl(api);
      case ComponentName.SOUND_UI:
        return new SoundUICtrl(api);
      case ComponentName.FREE_PLAYLIST_UI:
        return new FreePlaylistUICtrl(api);
      case ComponentName.TRACKS_DOWNLOAD_UI:
        return new TracksDownloadUICtrl(api);
      case ComponentName.DOWNLOADS_UI:
        return new DownloadsUICtrl(api);
    }
  }
};
