var Hapi = require('hapi'),
    Joi = require('joi'),
    mime =require('mime'),
    Torrent = require('../model/torrent');

exports.mount = function (server) {  
  server.route({
    method: 'GET',
    path: '/torrent/{torrent_key}/files/{file_id}',
    handler: function (request, reply) {
      Torrent.fetch(request.params.torrent_key, function (err, torrent) {
        if (err)
          return reply(new Error(err.message));

        var file = torrent.getFileById(request.params.file_id);

        if (!file)
          return reply(new Error('File does not exists'));

        var mimeType = mime.lookup(file.getPath());

        reply(file.getStream())
          .type(mimeType)
          .header('Content-Disposition', 'inline; filename="' + file.getName() + '"');
      }); 
    }, 
    config: {
      validate: {
        params: {
          torrent_key: Joi.string().required(),
          file_id: Joi.string().required()
        }
      }
    }
  });
};