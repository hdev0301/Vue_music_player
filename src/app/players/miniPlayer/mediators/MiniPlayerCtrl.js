var PlayerContext = require('../PlayerContext');

module.exports = function MiniPlayerCtrl(view) {
  var context = PlayerContext.get(view.getContextId());
  if (context.options.autoplay === true) {
    context.play();
  }
};
