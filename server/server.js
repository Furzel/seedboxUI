var Hapi = require('hapi'),
    Good = require('good'),
    routes = require('./routes'),
    GoodConsole = require('good-console');

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