var redis = require('redis'),
    async = require('async'),
    _ = require('lodash');

// This will fail if Redis is not started and throw an error, we don't catch it because there is no point in
// starting anything if there is no DB
var client = redis.createClient();

exports.saveData = function (jsonData, key, done) {
  var data = JSON.stringify(jsonData);

  client.set(key, data, function (err) {
    if (err) {
      console.log(err);
      return done({message: 'could not save data for key ' + key, source: 'redis', reason: 'redis_error'});
    }

    done();
  });
};

var getData = exports.getData = function (key, done) {
  client.get(key, function (err, data) {
    if (err)
      return done({message: 'could not fetch data for key' + key, source: 'redis', reason: 'redis_error'});

    if (!data)
      return done({message: 'no data found', source: 'redis', reason: 'not_found'});

    var json = null;

    try {
      json = JSON.parse(data);
    } catch (e) {
      return done({message: 'could not parse data', source: 'json_parse', reason: 'json_error'});
    }

    done(null, json);
  });
};

exports.getList = function (prefix, done) {
  _getKeyList('0', [], function (err, keys) {
    if (err)
      return done(err);

    var filteredKeys = _.filter(keys, function (key) {
      return key.startsWith(prefix);
    });

    async.mapSeries(filteredKeys, getData, done);
  });
};

function _getKeyList(cursor, keys, done) {
  client.scan(cursor, function (err, data) {
    if (err)
      return done({message: 'could not scan keys', source: 'redis', reason: 'redis_error'});

    var nextCursor = data[0],
        newKeys = data[1];

    keys = keys.concat(newKeys);

    if (nextCursor === '0')
      return done(null, keys);

    _getKeyList(nextCursor, keys, done);
  });
}








