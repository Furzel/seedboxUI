var server = require('./server/server'),
    torrentDriver = require('./server/driver/torrent');

console.log('Starting torrent driver');
torrentDriver.init(function (err) {
  if (err)
    console.log('Could not start torrent driver', err);

  console.log('all torrent restarted');
  server.start();
});
