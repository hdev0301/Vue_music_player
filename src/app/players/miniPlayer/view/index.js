var Vue = require('vue');
var MiniPlayer = require('./MiniPlayer');

module.exports = {
  create: function(container, contextId) {
    var player;
    container.innerHTML = '<mini-player-component v-with="contextId: ' + contextId + '" />';

    player = new Vue({
      el: container,
      components: {
        'mini-player-component': MiniPlayer
      },
      data: function() {
        return {
          contextId: contextId
        };
      }
    });

    return player;
  },
  destroy: function(player) {
    player.$destroy();
  }
};
