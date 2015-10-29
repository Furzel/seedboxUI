var _ = require('lodash');

var routes = [
  'public',
  'torrent'
];

exports.mount = function (server) {
  _.forEach(routes, function (routeFile) {
    console.log('mounting', routeFile, 'routes');
    require('./' + routeFile + '_routes').mount(server);
  });
};