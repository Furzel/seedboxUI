var Hapi = require('hapi'),
    Joi = require('joi'),
    _ = require('lodash'),
    Torrent = require('../model/torrent');

exports.mount = function (server) {
  server.route({
    method: 'POST',
    path: '/torrent/add',
    handler: function (request, reply) {
      Torrent.createFromUrl(request.payload.torrent_url, function (err, torrent) {
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
      Torrent.listAll(function (err, torrents) {
        if (err)
          return reply(new Error(err.message));

        reply(_.invoke(torrents, 'toJSON'));
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/torrent/{torrent_key}/pause',
    handler: function (request, reply) {
      Torrent.fetch(request.params.torrent_key, function (err, torrent) {
        if (err) {
          console.log(err);
          return reply(new Error(err.message));
        }

        torrent.pause(function (err) {
          if (err) {
            console.log(err);
            return reply(new Error(err.message));
          }

          reply(torrent.toJSON());
        });
      });
    },
    config: {
      validate: {
        params: {
          torrent_key: Joi.string().required()
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/torrent/{torrent_key}/restart',
    handler: function (request, reply) {
      Torrent.fetch(request.params.torrent_key, function (err, torrent) {
        if (err) {
          console.log('1', err);
          return reply(new Error(err.message));
        }

        torrent.restart(function (err) {
          if (err) {
            console.log('2', err);
            return reply(new Error(err.message));
          }

          reply(torrent.toJSON());
        });
      });
    },
    config: {
      validate: {
        params: {
          torrent_key: Joi.string().required()
        }
      }
    }
  });
};