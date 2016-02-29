require('./utils');

var should = require('chai').should(),
    mockery = require('mockery'),
    Torrent;

describe('Torrent', function () {
  before(function () {
    mockery.enable();
    mockery.warnOnUnregistered(false);

    mockery.registerMock('../driver/torrent', require('./mocks/torrent_driver'));

    Torrent = require('../../server/model/torrent');
  });


  it('should create a new Torrent object with attributes', function () {
    var torrent = Torrent.create({
      key: 'torrent_key',
      url: 'http://test.com',
      name: 'My torrent',
      files: []
    });

    torrent.getKey().should.equal('torrent_key');
    torrent.getUrl().should.equal('http://test.com');
    torrent.getName().should.equal('My torrent');
    torrent.isPaused().should.equal(false);
  });

  it('should save a torrent and retrieve it', function (done) {
    var torrent = Torrent.create({
      key: '12345',
      url: 'a',
      name: 'Torrent A'
    });

    torrent.save(function (err) {
      should.not.exist(err);

      Torrent.fetch('12345', function (err, savedTorrent) {
        should.not.exist(err);

        savedTorrent.getName().should.equal('Torrent A');

        done();
      });
    });
  });

  it('should pause a torrent', function (done) {
    Torrent.fetch('12345', function (err, torrent) {
      should.not.exist(err);

      torrent.pause(function (err) {
        should.not.exist(err);

        torrent.isPaused().should.equal(true);

        done();
      });
    });
  });

  it('should restart a torrent', function (done) {
    Torrent.fetch('12345', function (err, torrent) {
      should.not.exist(err);

      torrent.restart(function (err) {
        should.not.exist(err);

        torrent.isPaused().should.equal(false);

        done();
      });
    });
  });

  it('should create a new torrent from an URL', function (done) {
    Torrent.createFromUrl('http://test.test.com', function (err, torrent) {
      should.not.exist(err);

      torrent.getKey().should.equal('12346');

      done();
    });
  });

  it('should list the created torrent', function (done) {
    Torrent.listAll(function (err, torrents) {
      should.not.exist(err);

      torrents.should.have.length(2);

      done();
    });
  });

  after(function () {
    mockery.disable();
  });
});