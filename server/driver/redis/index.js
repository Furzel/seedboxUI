var config = require('../../../config'),
    driver = require('./' + config.redis_driver);

// Torrent manipulation

exports.getTorrentList = function (done) {
  driver.getList('torrent', done);
};

exports.saveTorrent = function (torrentData, done) {
  driver.saveData(torrentData, 'torrent-' + torrentData.key, done);
};

exports.getTorrent = function (key, done) {
  driver.getData('torrent-' + key, done);
};

