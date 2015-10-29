var redisDb = require('../driver/redis'),
    _ = require('lodash'),
    torrentDriver = require('../driver/torrent');

var Torrent = function (attributes) {
  this.key = attributes.key;
  this.url = attributes.url;
  this.name = attributes.name || null;
  this.files = attributes.files || [];
  this.paused = attributes.paused || false;
};

module.exports = Torrent;

Torrent.addNew = function (url, done) {
  torrentDriver.addNewTorrent(url, function (err, engine) {
    if (err)
      return done(err);

    var torrent = new Torrent({
      key: engine.torrent.infoHash,
      url: url,
      name: engine.torrent.name,  
      files: _parseEngineFiles(engine.torrent.files)
    });

    torrent.save(function (err) {
      if (err)
        return done(err);

      done(null, torrent.toJSON());
    });
  });
};

Torrent.fetch = function (key, done) {
  redisDb.getTorrent(key, function (err, data) {
    if (err)
      return done(err);

    return new Torrent(data);
  });
};

Torrent.listAll = function (done) {
  redisDb.getTorrentList(function (err, data) {
    if (err) 
      return done(err);

    var torrentList = _.map(data, function (torrent) {
      return new Torrent(torrent);
    });

    done(null, torrentList);
  });
};

Torrent.prototype.save = function (done) {
  redisDb.saveTorrent(this, done);
};

Torrent.prototype.toDatabase = function () {
  return {
    key: this.key,
    name: this.name,
    url: this.url,
    files: this.files,
    paused: this.paused
  };
};

Torrent.prototype.toJSON = function () {
  return {
    key: this.key,
    name: this.name,
    status: torrentDriver.getTorrentStatus(this),
    progress: torrentDriver.getTorrentProgress(this),
    file_count: this.files.length
  };
};

function _parseEngineFiles(files) {
  return _.map(files, function (file) {
    return {
      name: file.name,
      filePath: file.path,
      length: file.length
    };
  });
}