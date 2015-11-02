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
      torrentDriver.addNewTorrent(request.payload.torrent_url, function (err, torrent) {
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

  server.route({
    method: 'POST',
    path: '/torrent/{torrent_key}/pause',
    handler: function (request, reply) {
      torrentDriver.fetchTorrent(request.params.torrent_key, function (err, torrent) {
        if (err) {
          console.log(err);
          return reply(new Error(err.message));
        }

        torrentDriver.pauseTorrent(torrent, function (err) {
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
      torrentDriver.fetchTorrent(request.params.torrent_key, function (err, torrent) {
        if (err) {
          console.log('1', err);
          return reply(new Error(err.message));
        }

        torrentDriver.restartTorrent(torrent, function (err) {
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