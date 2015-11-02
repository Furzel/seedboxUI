var redisDb = require('../driver/redis'),
    _ = require('lodash'),
    torrentDriver = require('../driver/torrent');

module.exports.create = function (attributes) {
  var key = attributes.key,
      url = attributes.url,
      name = attributes.name || null,
      files = attributes.files || [],
      paused = attributes.paused || false;

  var toDatabase = function () {
    return {
      key: key,
      name: name,
      url: url,
      files: files,
      paused: paused
    };
  };

  return {
    save: function (done) {
      redisDb.saveTorrent(toDatabase(), done);
    },

    toJSON: function () {
      return {
        key: key,
        name: name,
        status: torrentDriver.getTorrentStatus(key, paused),
        progress: torrentDriver.getTorrentProgress(key)
      };
    },

    getKey: function () {
      return key;
    },

    getUrl: function () {
      return url;
    },

    setPaused: function (isPaused) {
      paused = isPaused;
    }
  };
};