var Hapi = require('hapi'),
    Joi = require('joi'),
    _ = require('lodash'),
    torrentDriver = require('../driver/torrent'),
    Torrent = require('../model/torrent');

exports.mount = function (server) {
  server.route({
    method: 'POST',
    path: '/torrent/add',
    handler: function (request, reply) {
      torrentDriver.addNew(request.payload.torrent_url, function (err, torrent) {
        if (err)
          return reply(new Error(err.message));

        reply(torrent.toJSON());
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
      torrentDriver.listAllTorrents(function (err, torrents) {
        if (err)
          return reply(new Error(err.message));

        reply(_.invoke(torrents, 'toJSON'));
      });
    }
  });
};