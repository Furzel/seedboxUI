var Hapi = require('hapi'),
    Good = require('good'),
    routes = require('./routes'),
    GoodConsole = require('good-console');

// RANDOM TORRENT
// https://hb1.ssl.hwcdn.net/torrents/Skullgirls.exe.torrent?gamekey=Eqe3BZwtmrb7peKe&ttl=1444217536&t=fbefaab3a7eb295223a142c1fe6154f3


exports.start = function () {
  var server = new Hapi.Server({});

  server.connection({
    host: 'localhost',
    port: 8000
  });

  // load routes
  routes.mount(server);

  server.register({
    register: Good,
    options: {
      reporters: [{
        reporter: GoodConsole,
        events: {
          response: '*',
          log: '*'
        }
      }]
    }
  }, function (err) {
    if (err) {
      throw err;
    }

    server.start(function () {
      console.log('Server started on port 8000');
    });
  });

  return server;
};