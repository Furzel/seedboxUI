require('./utils');

var should = require('chai').should(),
    async = require('async'),
    redis = require('../../server/driver/redis/mem');

describe('Redis mem', function () {
  before(function (done) {
    redis.reset();
    done();
  });

  it('should save data in memory and retrieve it', function (done) {
    var json = {name: 'Arthur Dent', age: 42};

    redis.saveData(json, 'arthur', function (err) {
      should.not.exist(err);

      redis.getData('arthur', function (err, data) {
        should.not.exist(err);

        data.name.should.equal('Arthur Dent');
        data.age.should.equal(42);

        done();
      });
    });
  });

  it('should save a list of data in memory and retrieve it', function (done) {
    var dataList = [
      {id: '1', title:'The Hitchhiker\'s Guide to the Galaxy'},
      {id: '2', title:'The Restaurant at the End of the Universe'},
      {id: '5', title:'Mostly Harmless'}
    ];

    async.eachSeries(dataList, function (data, done) {
      redis.saveData(data, 'book' + data.id, done);
    }, function (err) {
      should.not.exist(err);

      redis.getList('book', function (err, list) {
        should.not.exist(err);

        list.should.have.length(3);

        done();
      });
    });
  });

  after(function (done) {
    redis.reset();
    done();
  });
});