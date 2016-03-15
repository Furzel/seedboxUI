var Torrent = require('../../model/torrent'),
    config = require('../../config'),
    _ = require('lodash'),
    torrentStream = require('torrent-stream'),
    async = require('async');

var runningEngines = {};

var torrentConfig = {
  connections: config.max_connections || 100,
  uploads: config.max_uploads || 100,
  tmp: config.tmp_path,
  path: config.download_path
};

exports.init = function (done) {
  Torrent.listAll(function (err, torrents) {
    if (err)
      return done(err);

    console.log('Restarting', torrents.length, 'torrents');

    async.eachSeries(torrents, function (torrent, done) {
      if (torrent.isPaused())
        return done();
      
      restartTorrent(torrent, done);
    }, done);
  });
};

exports.createTorrent = function (url, done) {
  // TODO check if the torrent already exist (warning to user)

  var engine = torrentStream(url, torrentConfig);

  engine.on('ready', function () {
    done(null, {
      key: engine.torrent.infoHash,
      url: url,
      name: engine.torrent.name,
      files: _parseEngineFiles(engine.torrent.files),
      nb_parts: engine.torrent.pieces.length
    });
  });
};

var restartTorrent = exports.restartTorrent = function (torrent, done) {
  _destroyEngine(torrent.getKey(), function (err) {
    if (err)
      return done(err);

    var engine = torrentStream(torrent.getUrl(), torrentConfig);

    torrent.resetProgress();

    _startEngine(engine, torrent, function (err) {
      if (!err)
        return done(); 

      done({message: 'Could not start engine for torrent ' + torrent.getKey(), source: 'torrent_driver', reason:'driver_error'});
    });
  });
};

exports.pauseTorrent = function (torrent, done) {
  _destroyEngine(torrent.getKey(), function (err) {
    if (!err)
      return done();

    done({message: 'Could not destroy engine for torrent ' + torrent.getKey(), source:'torrent_driver', reason:'driver_error'});
  });
};

function _startEngine (engine, torrent, done) {
  var torrentKey = engine.infoHash;

  engine.on('ready', function () {
    // save engine reference
    runningEngines[torrentKey] = engine;

    _.forEach(engine.files, function (file) {
      file.select();
    });

    console.log('Started torrent', torrentKey, engine.torrent.name);
    // download started for all files
    done();
  });

  engine.on('verify', function () {
    torrent.partDownloaded();
  });

  engine.on('upload', function () {
    // TODO: compute up/down ratio
  });
}
 
function _destroyEngine (key, done) {
  if (!runningEngines[key])
    return done();

  runningEngines[key].destroy(function (err) {
    runningEngines[key] = null;

    done(err);
  });
}

function _parseEngineFiles(files) {
  var fileCount = 0;
  return _.map(files, function (file) {
    fileCount++;

    return {
      id: fileCount.toString(),
      name: file.name,
      file_path: file.path,
      length: file.length
    };
  });
}