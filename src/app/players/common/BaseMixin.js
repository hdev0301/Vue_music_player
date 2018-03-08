var Reflux = require('reflux');

var onReady = Reflux.createAction({
  sync: true
});

module.exports = {
  onComponentReady: function(fn) {
    return onReady.listen(fn);
  },
  mixin: {
    created: function() {
      this._baseMixin = {
        listeners: [],
        actions: {
          onDestroy: Reflux.createAction()
        }
      };

      if (typeof this.$options.actionsFactory === 'function') {
        var actions = this.$options.actionsFactory();
        for (var key in actions) {
          if (!actions.hasOwnProperty(key)) {
            continue;
          }
          this._baseMixin.actions[key] = actions[key];
        }
      }
    },
    compiled: function() {
      if (typeof this.$options.name !== 'undefined') {
        onReady(this.$options.name, this);
      }
    },
    beforeDestroy: function() {
      var listeners = this._baseMixin.listeners;
      while (listeners.length) {
        listeners.pop()();
      }
      this._baseMixin.actions.onDestroy();
    },
    methods: {
      listenTo: function(action, fn) {
        var listeners = this._baseMixin.listeners;
        if (typeof action.listen === 'function') {
          listeners.push(action.listen(fn));
        } else {
          listeners.push(action(fn));
        }
      },
      getActions: function() {
        return this._baseMixin.actions;
      },
      getContextId: function() {
        return this.$data.contextId;
      },
      setInitialData: function(data) {
        data = data || {};
        for (var key in data) {
          if (!data.hasOwnProperty(key)) {
            continue;
          }
          this[key] = data[key];
        }
      }
    }
  }
};
