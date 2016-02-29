var redisDb = require('../driver/redis'),
    _ = require('lodash'),
    torrentDriver = require('../driver/torrent');

var create = exports.create = function (attributes) {
  var key = attributes.key,
      url = attributes.url,
      name = attributes.name || null,
      files = attributes.files || [],
      paused = attributes.paused || false,
      nbParts = attributes.nb_parts,
      downloadedParts = attributes.downloaded_parts || 0;

  var toDatabase = function () {
    return {
      key: key,
      name: name,
      url: url,
      paused: paused,
      nb_parts: nbParts,
      downloaded_parts: downloadedParts,
      files: files
    };
  };

  // When restarting a torrent or during a download we get notified
  // for downloaded parts, this can get quite bursty and we do not want
  // to fire a db update for every part, we only do the save every
  // 500 ms, even if the save is async we want this function to be
  // synchronous since it will most likely do nothing
  var throttledSave = _.throttle(function () {
    redisDb.saveTorrent(toDatabase(), function () {});
  }, 500, {trailing: true});

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
        status: this.getStatus(),
        progress: this.getProgress()
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

    getProgress: function () {
      return downloadedParts / nbParts * 100;
    },

    resetProgress: function () {
      downloadedParts = 0;
    },

    getStatus: function () {
      if (paused)
        return 'paused';

      if (downloadedParts === 0)
        return 'added';

      if (downloadedParts === nbParts)
        return 'complete';

      return 'running';
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
    },

    partDownloaded: function () {
      downloadedParts++;

      if (downloadedParts === nbParts)
        console.log('Torrent', name, 'completed !');
        // TODO: attach event handler

      throttledSave();
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
  torrentDriver.createTorrent(url, function (err, torrentData) {
    var torrent = create(torrentData);

    torrentDriver.restartTorrent(torrent, function (err) {
      if (err)
        return done(err);

      torrent.save(done);
    });
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