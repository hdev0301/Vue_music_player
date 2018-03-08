var PlayerContext = require('./PlayerContext');
var view = require('./view');

var BaseMixin = require('../common/BaseMixin');
var injector = require('./injector');
BaseMixin.onComponentReady(injector.inject);

var map = {};

module.exports = {
  create: function(el, track, options) {
    var contextId = PlayerContext.create(track, options);
    map[contextId] = {
      contextId: contextId,
      view: view.create(el, contextId)
    };
    return contextId;
  },
  destroy: function(id) {
    var record = map[id] || null;
    if (record === null) {
      return;
    }
    view.destroy(record.view);
    delete map[id];
  }
};
