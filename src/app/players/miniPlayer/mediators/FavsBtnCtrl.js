var favoriteTracks = require('../../../favoriteTracks');
var PlayerContext = require('../PlayerContext');

module.exports = function FavsBtnCtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var listeners;

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  function add() {
    favoriteTracks.add(context.track);
  }

  listeners = [
    viewActions.onDestroy.listen(destroy),
    viewActions.add.listen(add)
  ];
};
