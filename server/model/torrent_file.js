var fs = require('fs'),
    config = require('../config'),
    path = require('path');

exports.create = function (attributes) {
  var id = attributes.id,
      name = attributes.name,
      filePath = attributes.file_path,
      length = attributes.length;

  return {
    getId: function () {
      return id;
    },

    getName: function () {
      return name;
    },

    getStream: function () {
      return fs.createReadStream(this.getPath(), {flags: 'r'});
    },

    getPath: function () {
      return path.join(config.download_path, filePath);
    },

    toDatabase: function () {
      return {
        id: id,
        name: name,
        file_path: filePath,
        length: length
      };
    },

    toJSON: function () {
      return {
        id: id,
        name: name
      };
    }
  };
};