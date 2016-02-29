var redisDb = require('../driver/redis'),
    _ = require('lodash'),
    torrentDriver = require('../driver/torrent');

var create = exports.create = function (attributes) {
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
      var self = this;

      redisDb.saveTorrent(toDatabase(), function (err) {
        if (err)
          return done(err);

        done(null, self);
      });
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

    getName: function () {
      return name;
    },

    pause: function (done) {
      var self = this;

      torrentDriver.pauseTorrent(self, function (err) {
        if (err)
          return done(err);

        paused = true;

        self.save(done);
      });
    },

    restart: function (done) {
      var self = this;

      torrentDriver.restartTorrent(self, function (err) {
        if (err)
          return done(err);

        paused = false;

        self.save(done);
      });
    },

    isPaused: function () {
      return paused;
    }
  };
};

exports.fetch = function (key, done) {
  redisDb.getTorrent(key, function (err, data) {
    if (err) 
      return done(err);

    var torrent = create(data);

    done(null, torrent);
  });
};

exports.createFromUrl = function (url, done) {
  torrentDriver.addNewTorrent(url, function (err, data) {
    if (err)
      return done(err);

    var torrent = create(data);

    torrent.save(done);
  });
};

exports.listAll = function (done) {
  redisDb.getTorrentList(function (err, dataList) {
    if (err)
      return done(err);

    var torrentList = _.map(dataList, function (torrentData) {
      return create(torrentData);
    });

    done(null, torrentList);
  });
};