var PlayerContext = require('../PlayerContext');
var cart = require('../../../cart/cart');

module.exports = function CartBtnCtrl(viewApi) {
  var viewActions = viewApi.getActions();
  var context = PlayerContext.get(viewApi.getContextId());
  var listeners;

  function onAdded(track) {
    if (track.id === context.track.id) {
      viewActions.onAdded();
    }
  }

  function onRemoved(track) {
    if (track.id === context.track.id) {
      viewActions.onRemoved();
    }
  }

  function onClean() {
    viewActions.onRemoved();
  }

  function add() {
    cart.add(context.track);
  }

  function remove() {
    cart.del(context.track);
  }

  function destroy() {
    while (listeners.length) {
      listeners.pop()();
    }
  }

  listeners = [
    cart.onAdded(onAdded),
    cart.onRemoved(onRemoved),
    cart.onClean(onClean),
    viewActions.onDestroy.listen(destroy),
    viewActions.add.listen(add),
    viewActions.remove.listen(remove)
  ];

  viewApi.setInitialData({
    added: cart.contains(context.track)
  });
};
