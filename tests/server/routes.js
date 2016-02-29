require('./utils');

var should = require('chai').should(),
    mockery = require('mockery'),
    server;

describe('Routes', function () {
  before(function () {
    mockery.enable();
    mockery.warnOnUnregistered(false);

    mockery.registerMock('../driver/torrent', require('./mocks/torrent_driver'));

    server = require('../../server/server').start();
  });

  describe('Public routes', function () {
    it('should retrieve index page', function (done) {
      server.inject({method: 'GET', url: '/'}, function (response) {
        response.statusCode.should.equal(200);

        done();
      });
    });
  });

  describe('Torrent routes', function () {
    it('should add a torrent', function (done) {
      var options = {
        method: 'POST',
        url: '/torrent/add',
        payload: {torrent_url: 'http://random.url.com'}
      };

      server.inject(options, function (response) {
        response.statusCode.should.equal(200);
        response.result.key.should.equal('12346');
        response.result.status.should.equal('running');

        done();
      });
    });

    it('should pause a torrent', function (done) {
      var options = {
        method: 'POST',
        url: '/torrent/12346/pause'
      };

      server.inject(options, function (response) {
        response.statusCode.should.equal(200);
        response.result.status.should.equal('paused');

        done();
      });
    });

    it('should restart a torrent', function (done) {
      var options = {
        method: 'POST',
        url: '/torrent/12346/restart'
      };

      server.inject(options, function (response) {
        response.statusCode.should.equal(200);
        response.result.status.should.equal('running');

        done();
      });
    });

    it('should list all torrents', function (done) {
      var options = {
        method: 'GET',
        url: '/torrent/all'
      };

      server.inject(options, function (response) {
        response.statusCode.should.equal(200);
        response.result.should.have.length(1);   

        done();     
      });
    });
  });

  after(function () {
    mockery.disable();
  });
});