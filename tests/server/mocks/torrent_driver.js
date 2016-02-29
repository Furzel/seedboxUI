var _ = require('lodash');

exports.pauseTorrent = function (torrent, done) { _.defer(done); };

exports.restartTorrent = function (torrent, done) { _.defer(done); };

exports.createTorrent = function (url, done) {
  done(null, {
    key: '12346',
    url: url,
    name: 'new-torrent-' + url,
    files: []
  });
};