var Vue = require('vue');
var Reflux = require('reflux');
var BaseMixin = require('../../common/BaseMixin');
var ComponentName = require('./ComponentName');
var PlusOneAnimation = require('../../common/PlusOneAnimation');

var FavsBtn = Vue.extend({
  mixins: [
    BaseMixin.mixin
  ],
  actionsFactory: function() {
    return {
      add: Reflux.createAction({
        sync: true
      })
    };
  },
  name: ComponentName.FAVS_BTN,
  template: require('../tpl/favs-btn.tpl.html'),
  replace: true,
  ready: function() {
    this.plusOneAnimation = new PlusOneAnimation(this.$el.querySelector('.btn__icon'));
  },
  beforeDestroy: function() {
    this.plusOneAnimation.destroy();
    this.plusOneAnimation = null;
  },
  methods: {
    add: function(event) {
      event.preventDefault();
      this.getActions().add();
      this.plusOneAnimation.show();
    }
  }
});

module.exports = FavsBtn;
