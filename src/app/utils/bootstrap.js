var miniPlayerNodeParser = require('./miniPlayerNodeParser');
var bigPlayerNodeParser = require('./bigPlayerNodeParser');
var miniPlayer = require('../players/miniPlayer');
var bigPlayer = require('../players/bigPlayer');
var cart = require('../cart/cart');
var FavoriteTracksCounter = require('../misc/FavoriteTracksCounter');
var CartTracksCounter = require('../misc/CartTracksCounter');

cart.sync();

function toArray(obj) {
  return Array.prototype.slice.call(obj);
}

function onDomReady(fn) {
  if (document.readyState !== 'loading') {
    nextTick(fn);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      nextTick(fn);
    }, false);
  }
}

function nextTick(fn) {
  setTimeout(fn);
}

function initMiniPlayers() {
  var cfg;

  var playerNodes = document.querySelectorAll('[mini-player],[data-mini-player]');
  playerNodes = toArray(playerNodes);

  playerNodes.forEach(function(node) {
    cfg = miniPlayerNodeParser.parse(node);
    miniPlayer.create(cfg.el, cfg.track, cfg.options);
  });
}

function initBigPlayers(selector) {
  var cfg;

  var playerNodes = document.querySelectorAll(selector);
  playerNodes = toArray(playerNodes);

  playerNodes.forEach(function(node) {
    cfg = bigPlayerNodeParser.parse(node);
    bigPlayer.create(node, cfg.playlists, cfg.options);
  });
}

function initFavoriteTracksCounters() {
  var nodes = document.querySelectorAll('[favs-counter],[data-favs-counter]');
  nodes = toArray(nodes);

  nodes.forEach(function(node) {
    return new FavoriteTracksCounter(node);
  });
}

function initCartTracksCounters() {
  var nodes = document.querySelectorAll('[cart-counter],[data-cart-counter]');
  nodes = toArray(nodes);

  nodes.forEach(function(node) {
    return new CartTracksCounter(node);
  });
}

function bootstrap() {
  initMiniPlayers();
  initBigPlayers('[big-player],[data-big-player]');
  initFavoriteTracksCounters();
  initCartTracksCounters();
}

module.exports = {
  bootstrap: function() {
    onDomReady(bootstrap);
  },
  createBigPlayer: function(selector) {
    onDomReady(function() {
      initBigPlayers(selector);
    });
  },
  onDomReady: onDomReady
};
