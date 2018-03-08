var ACTIVE_CLASS_NAME = 'plus-one-animation--active';

function getTransitionEndEventName() {
  var map = {
    transition: 'transitionend',
    OTransition: 'oTransitionEnd',
    MozTransition: 'transitionend',
    WebkitTransition: 'webkitTransitionEnd'
  };

  var el = document.createElement('div');
  for (var key in map) {
    if (!map.hasOwnProperty(key)) {
      continue;
    }

    if (typeof el.style[key] !== 'undefined') {
      return map[key];
    }
  }

  return null;
}

var TRANSITION_END_EVENT = getTransitionEndEventName();
var isTransitionSupported = TRANSITION_END_EVENT !== null;

function addClassName(el, className) {
  var parts = el.className.split(' ');
  if (parts.indexOf(className) > -1) {
    return;
  }
  parts.push(className);
  el.className = parts.join(' ');
}

function removeClassName(el, className) {
  var parts = el.className.split(' ');
  var index = parts.indexOf(className);
  if (index === -1) {
    return;
  }
  parts.splice(index, 1);
  el.className = parts.join(' ');
}

module.exports = function PlusOneAnimation(root) {
  var el = document.createElement('div');
  el.className = 'plus-one-animation';
  el.innerHTML = '+1';
  root.appendChild(el);

  var isActive = false;

  function onTransitionEnd() {
    isActive = false;
    el.removeEventListener(TRANSITION_END_EVENT, onTransitionEnd, false);
    removeClassName(el, ACTIVE_CLASS_NAME);
  }

  var api = {};

  api.show = function() {
    if (!isTransitionSupported || isActive) {
      return;
    }
    isActive = true;
    el.addEventListener(TRANSITION_END_EVENT, onTransitionEnd, false);
    setTimeout(function() {
      addClassName(el, ACTIVE_CLASS_NAME);
    }, 100);
  };

  api.destroy = function() {
    el.removeEventListener(TRANSITION_END_EVENT, onTransitionEnd, false);
    removeClassName(el, ACTIVE_CLASS_NAME);
    el = null;
  };

  return api;
};
