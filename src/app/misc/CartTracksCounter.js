var cart = require('../cart/cart');

module.exports = function CartTracksCounter(el) {
  el.innerHTML = cart.getTracks().length;
  cart.onChange(function() {
    el.innerHTML = cart.getTracks().length;
  });
};
