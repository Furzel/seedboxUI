var Torrent = require('../../model/torrent'),
    config = require('../../../config'),
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
      restartTorrent(torrent, done);
    }, done);
  });
};

exports.addNewTorrent = function (url, done) {
  // TODO check if the torrent already exist (warning to user)

  var engine = torrentStream(url, torrentConfig);

  _startEngine(engine, function (err) {
    done(err, engine);
  });
};

var restartTorrent = exports.restartTorrent = function (torrent, done) {
  console.log('restarting torrent', torrent.name);
  _maybeDestroyOldEngine(torrent.key, function (err) {
    if (err)
      return done(err);

    var engine = torrentStream(torrent.url, torrentConfig);

    _startEngine(engine, done);
  });
};

exports.getTorrentStatus = function (torrent) {
  if (torrent.paused)
    return 'paused';

  if (!torrentProgress[torrent.key] || torrentProgress[torrent.key] === 0)
    return 'added';

  var engine = _getEngine(torrent);

  if (!engine || !engine.torrent || !engine.torrent.pieces)
    return 'unknown';

  if (torrentProgress[torrent.key] === engine.torrent.pieces.length)
    return 'complete';

  return 'running';
};

exports.getTorrentProgress = function (torrent) {
  var engine = _getEngine(torrent);

  if (!torrentProgress[torrent.key])
    return 0;

  if (!engine || !engine.torrent || !engine.torrent.pieces)
    return null;

  return torrentProgress[torrent.key] / engine.torrent.pieces.length * 100;
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

function _maybeDestroyOldEngine (key, done) {
  if (!runningEngines[key])
    return done();

  runningEngines[key].destroy(done);
}

function _getEngine (torrent) {
  if (!runningEngines[torrent.key])
    return null;

  return runningEngines[torrent.key];
}