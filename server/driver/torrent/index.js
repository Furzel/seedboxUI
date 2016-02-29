var Torrent = require('../../model/torrent'),
    config = require('../../config'),
    _ = require('lodash'),
    torrentStream = require('torrent-stream'),
    async = require('async');

var runningEngines = {},
    torrentProgress = {};

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

exports.addNewTorrent = function (url, done) {
  // TODO check if the torrent already exist (warning to user)

  var engine = torrentStream(url, torrentConfig);

  _startEngine(engine, function (err) {
    if (err)
      return done(err);

    done(null, {
      key: engine.torrent.infoHash,
      url: url,
      name: engine.torrent.name,
      files: _parseEngineFiles(engine.torrent.files)
    });
  });
};

var restartTorrent = exports.restartTorrent = function (torrent, done) {
  _destroyEngine(torrent.getKey(), function (err) {
    if (err)
      return done(err);

    var engine = torrentStream(torrent.getUrl(), torrentConfig);

    _startEngine(engine, function (err) {
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

exports.getTorrentStatus = function (key, paused) {
  console.log(key, paused);
  if (paused)
    return 'paused';

  if (!torrentProgress[key] || torrentProgress[key] === 0)
    return 'added';

  var engine = _getEngine(key);

  if (!engine || !engine.torrent || !engine.torrent.pieces)
    return 'unknown';

  if (torrentProgress[key] === engine.torrent.pieces.length)
    return 'complete';

  return 'running';
};

exports.getTorrentProgress = function (key) {
  if (!torrentProgress[key])
    return 0;

  var engine = _getEngine(key);

  if (!engine || !engine.torrent || !engine.torrent.pieces)
    return null;

  return torrentProgress[key] / engine.torrent.pieces.length * 100;
};

function _startEngine (engine, done) {
  var torrentKey = engine.infoHash;

  torrentProgress[torrentKey] = 0;

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
    torrentProgress[torrentKey]++;

    if (torrentProgress[torrentKey] === engine.torrent.pieces.length)
      console.log('Torrent', engine.torrent.name, 'completed !');
      // TODO: attach torrent complete handler
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

function _getEngine (key) {
  if (!runningEngines[key])
    return null;

  return runningEngines[key];
}

function _parseEngineFiles(files) {
  return _.map(files, function (file) {
    return {
      name: file.name,
      filePath: file.path,
      length: file.length
    };
  });
}