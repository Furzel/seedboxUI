var _ = require('lodash');

exports.pauseTorrent = function (torrent, done) { _.defer(done); };

exports.restartTorrent = function (torrent, done) { _.defer(done); };

exports.addNewTorrent = function (url, done) {
  _.defer(function () {
    done(null, {
      key: '12346',
      url: url,
      name: 'new-torrent-' + url,
      files: []
    });
  });
};

