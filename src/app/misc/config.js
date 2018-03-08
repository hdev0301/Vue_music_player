var api = {};

api.data = {
  userId: ''
};

api.config = function(data) {
  data = data || {};

  for (var key in data) {
    if (!data.hasOwnProperty(key)) {
      continue;
    }
    api.data[key] = data[key];
  }
};

module.exports = api;
