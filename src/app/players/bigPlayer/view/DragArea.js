var Reflux = require('reflux');

function on(elem, event, fn) {
  return elem.addEventListener ? elem.addEventListener(event, fn, false) : elem.attachEvent('on' + event, fn);
}

function off(elem, event, fn) {
  return elem.addEventListener ? elem.removeEventListener(event, fn, false) : elem.detachEvent('on' + event, fn);
}

function pauseEvent(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (e.preventDefault) {
    e.preventDefault();
  }

  e.cancelBubble = true;
  e.returnValue = false;
  return false;
}

function calculateRatio(el, event) {
  var rect = el.getBoundingClientRect();
  var width = rect.right - rect.left;
  var x;
  if (typeof event.clientX !== 'undefined') {
    x = event.clientX - rect.left;
  } else {
    x = event.pageX - rect.left;
  }
  x = Math.min(Math.max(0, x), width);
  return x / width;
}

var TICKS_PER_SECOND = 10;

module.exports = function DragArea(el) {
  var actions = {
    onStart: Reflux.createAction({
      sync: true
    }),
    onDrag: Reflux.createAction({
      sync: true
    }),
    onEnd: Reflux.createAction({
      sync: true
    })
  };

  var ratio = NaN;
  var lastNotifiedRatio = NaN;

  var timeout = null;

  function startDelay() {
    if (timeout !== null) {
      return;
    }

    timeout = setTimeout(function() {
      timeout = null;
      if (lastNotifiedRatio === ratio) {
        return;
      }
      lastNotifiedRatio = ratio;
      actions.onDrag(lastNotifiedRatio);
    }, 1000 / TICKS_PER_SECOND);
  }

  function stopDelay() {
    if (timeout === null) {
      return;
    }
    clearTimeout(timeout);
    timeout = null;
  }

  var api = {};

  function onUp(event) {
    off(document, 'mousemove', onMove);
    off(document, 'mouseup', onUp);

    off(document, 'touchmove', onMove);
    off(document, 'touchend', onUp);

    stopDelay();
    actions.onEnd(calculateRatio(el, event));
  }

  function onMove(event) {
    if (Array.isArray(event.touches)) {
      if (event.touches.length > 1) {
        return;
      }
      event = event.touches[0];
    }

    var newRatio = calculateRatio(el, event);
    if (ratio === newRatio) {
      return;
    }
    ratio = newRatio;
    startDelay();
  }

  function onDown(event) {
    pauseEvent(event);

    on(document, 'mousemove', onMove);
    on(document, 'mouseup', onUp);

    on(document, 'touchmove', onMove);
    on(document, 'touchend', onUp);

    ratio = calculateRatio(el, event);
    lastNotifiedRatio = NaN;
    actions.onStart(ratio);
  }

  on(el, 'mousedown', onDown);
  on(el, 'touchstart', onDown);

  api.destroy = function() {
    off(el, 'mousedown', onDown);
    off(el, 'touchstart', onDown);

    off(document, 'mousemove', onMove);
    off(document, 'mouseup', onUp);

    off(document, 'touchmove', onMove);
    off(document, 'touchend', onUp);

    stopDelay();
  };

  api.onStart = function(fn) {
    return actions.onStart.listen(fn);
  };

  api.onDrag = function(fn) {
    return actions.onDrag.listen(fn);
  };

  api.onEnd = function(fn) {
    return actions.onEnd.listen(fn);
  };

  return api;
};
