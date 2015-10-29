var Path = require('path');

exports.mount = function (server) {
  // static files
  server.register(require('inert'), function (err) {
    if (err)
      throw err;

    server.route({
      method: 'GET',
      path: '/',
      handler: function (request, reply) {
        reply.file(Path.join(__dirname, '../../public/index.html'));
      } 
    });

    server.route({
      method: 'GET',
      path: '/public/{param*}',
      handler: {
        directory: {
          path: 'public'
        }
      }
    });
  });
};