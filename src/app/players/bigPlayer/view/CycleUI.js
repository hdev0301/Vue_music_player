var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');

var CycleUI = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  actionsFactory: function() {
    return {
      cycleOn: Reflux.createAction({
        sync: true
      }),
      cycleOff: Reflux.createAction({
        sync: true
      }),
      onActiveChanged: Reflux.createAction({
        sync: true
      })
    };
  },
  name: ComponentName.CYCLE_UI,
  ready: function() {
    var actions = this.getActions();
    this.listenTo(actions.onActiveChanged, this.onActiveChanged);
  },
  data: function() {
    return {
      active: false
    };
  },
  template: require('../tpl/cycle-ui.tpl.html'),
  replace: true,
  methods: {
    onActiveChanged: function(value) {
      this.active = value;
    },
    cycleOn: function(event) {
      event.preventDefault();
      this.getActions().cycleOn();
    },
    cycleOff: function(event) {
      event.preventDefault();
      this.getActions().cycleOff();
    }
  }
});

module.exports = CycleUI;
