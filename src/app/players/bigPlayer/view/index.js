var Vue = require('vue');
var BigPlayer = require('./BigPlayer');

module.exports = {
  create: function(container, contextId) {
    container.setAttribute('data-player-id', contextId);
    container.innerHTML = '<big-player v-with="contextId: ' + contextId + '"/>';

    return new Vue({
      el: container,
      components: {
        'big-player': BigPlayer
      },
      data: function() {
        return {
          contextId: contextId
        };
      }
    });
  }
};
