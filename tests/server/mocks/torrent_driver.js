var _ = require('lodash');

exports.pauseTorrent = function (torrent, done) { _.defer(done); };

exports.restartTorrent = function (torrent, done) { _.defer(done); };

exports.createTorrent = function (url, done) {
  var torrentJSON = require('./torrents/' + url);
  done(null, torrentJSON);
};