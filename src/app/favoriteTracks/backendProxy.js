var reqwest = require('reqwest');

module.exports = {
  sendAddRequest: function(track, cb) {
    var cfg = {
      url: '/get/favorites/',
      type: 'text',
      data: {
        trid: track.id,
        _: Date.now()
      },
      success: function(data) {
        cb(null, data.responseText);
      },
      error: function(err) {
        cb(err);
      }
    };

    reqwest(cfg);
  }
};
