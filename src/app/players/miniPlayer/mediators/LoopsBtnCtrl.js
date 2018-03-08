var PlayerContext = require('../PlayerContext');

module.exports = function LoopsBtnCtrl(viewApi) {
  var context = PlayerContext.get(viewApi.getContextId());
  viewApi.setInitialData({
    track: context.track
  });
};
