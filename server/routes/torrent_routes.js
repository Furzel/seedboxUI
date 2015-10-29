var Hapi = require('hapi'),
    Joi = require('joi'),
    _ = require('lodash'),
    Torrent = require('../model/torrent');

exports.mount = function (server) {
  server.route({
    method: 'POST',
    path: '/torrent/add',
    handler: function (request, reply) {
      Torrent.addNew(request.payload.torrent_url, function (err, torrent) {
        console.log(err, torrent);
        
        if (err)
          return reply(new Error(err.message));

        reply(torrent);
      });
    },
    config: {
      validate: {
        payload: {
          torrent_url: Joi.string().required()
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/torrent/all',
    handler: function (request, reply) {
      Torrent.listAll(function (err, torrents) {
        if (err)
          return reply(new Error(err.message));

        reply(_.invoke(torrents, Torrent.prototype.toJSON));
      });
    }
  });
};