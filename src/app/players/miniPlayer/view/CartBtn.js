var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');

var CartBtn = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  actionsFactory: function() {
    return {
      add: Reflux.createAction({
        sync: true
      }),
      remove: Reflux.createAction({
        sync: true
      }),
      onAdded: Reflux.createAction({
        sync: true
      }),
      onRemoved: Reflux.createAction({
        sync: true
      })
    };
  },
  name: ComponentName.CART_BTN,
  ready: function() {
    var actions = this.getActions();
    this.listenTo(actions.onAdded, this.onAdded);
    this.listenTo(actions.onRemoved, this.onRemoved);
  },
  data: function() {
    return {
      added: false
    };
  },
  template: require('../tpl/cart-btn.tpl.html'),
  replace: true,
  methods: {
    onAdded: function() {
      this.added = true;
    },
    onRemoved: function() {
      this.added = false;
    },
    add: function(event) {
      event.preventDefault();
      this.getActions().add();
    },
    remove: function(event) {
      event.preventDefault();
      this.getActions().remove();
    }
  }
});

module.exports = CartBtn;
