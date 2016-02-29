var _ = require('lodash'),
    async = require('async');

var database = {};

exports.reset = function () {
  database = {};
};

exports.saveData = function (jsonData, key, done) {
  _.defer(function () {
    database[key] = jsonData;

    done();
  });
};

var getData = exports.getData = function (key, done) {
  _.defer(function () {
    done(null, database[key]);
  });
};

exports.getList = function (prefix, done) {
  var keyList = _.chain(database)
   .keys()
   .filter(function (key) {
      return key.startsWith(prefix);
   })
   .value();

   async.mapSeries(keyList, getData, done);
};