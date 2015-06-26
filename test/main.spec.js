'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var mockery = require('mockery');

describe('settings-file', function () {
  describe('constructor', function () {
    var SettingsFile = require('../lib');

    describe('without parameters', function () {
      it('should reject an empty call', function () {
        var fn = function () {
          new SettingsFile();
        };

        expect(fn).to.throw(TypeError, 'SettingsFile must accept an app name');
      });
    });

    describe('with invalid parameters', function () {
      it('should reject app as function', function () {
        var fn = function () {
          new SettingsFile(function () {
          });
        };

        expect(fn).to.throw(TypeError, 'app name must be a string');
      });

      it('should reject app as object', function () {
        var fn = function () {
          new SettingsFile({});
        };

        expect(fn).to.throw(TypeError, 'app name must be a string');
      });

      it('should reject app as number', function () {
        var fn = function () {
          new SettingsFile(5);
        };

        expect(fn).to.throw(TypeError, 'app name must be a string');
      });

      it('should reject app as boolean', function () {
        var fn = function () {
          new SettingsFile(true);
        };

        expect(fn).to.throw(TypeError, 'app name must be a string');
      });
    });

    describe('with valid parameters', function () {
      it('should', function () {
        var fn = function () {
          new SettingsFile('test');
        };

        expect(fn).to.not.throw();
      });
    });
  });

  describe('get', function () {
    describe('existing app', function () {
      var test = { global: { test: 'test' } };
      var SettingsFile;

      beforeEach(function () {
        var jsonfile = {
          readFileSync: sinon.stub().returns(test),
          readFile: sinon.stub().callsArgWith(1, null, test)
        };

        mockery.registerMock('jsonfile', jsonfile);

        mockery.enable({
          useCleanCache: true,
          warnOnUnregistered: false
        });

        SettingsFile = require('../lib');
      });

      describe('without defaults', function () {
        it('should return the file content', function (done) {
          var settings = new SettingsFile('test');

          settings.get().then(function (config) {
            expect(config.test).to.eql(test.global.test);
            done();
          }).catch(function (err) {
            done(err);
          });
        });
      });

      describe('with defaults', function () {
        it('should return the file content combined with defaults', function (done) {
          var defaults = {
            test: 'defaultTest',
            test2: 'defaultTest2'
          };
          var settings = new SettingsFile('test', {
            globalDefaults: defaults
          });

          settings.get().then(function (config) {
            expect(config.test).to.equal(test.global.test);
            expect(config.test2).to.equal(defaults.test2);
            done();
          }).catch(function (err) {
            done(err);
          });
        });
      });

      afterEach(function () {
        mockery.deregisterMock('jsonfile');
        mockery.disable();
      });
    });

    describe('non existing app', function () {
      var SettingsFile;

      beforeEach(function () {
        var jsonfile = {
          readFileSync: sinon.stub().throws('err'),
          readFile: sinon.stub().callsArgWith(1, 'err')
        };

        mockery.registerMock('jsonfile', jsonfile);

        mockery.enable({
          useCleanCache: true,
          warnOnUnregistered: false
        });

        SettingsFile = require('../lib');
      });

      describe('without defaults', function () {
        it('should return empty json', function (done) {
          var settings = new SettingsFile('test');

          settings.get().then(function (config) {
            expect(config).to.eql({});
            done();
          }).catch(function (err) {
            done(err);
          });
        });
      });

      describe('with defaults', function () {
        it('should return the defaults', function (done) {
          var defaults = {
            test: 'defaultTest',
            test2: 'defaultTest2'
          };
          var settings = new SettingsFile('exists', {
            globalDefaults: defaults
          });

          settings.get().then(function (config) {
            expect(config).to.eql(defaults);
            done();
          }).catch(function (err) {
            done(err);
          });
        });
      });

      afterEach(function () {
        mockery.deregisterMock('jsonfile');
        mockery.disable();
      });
    });
  });

  xdescribe('#delete', function () {});

  xdescribe('exports', function () {
    it('should expose a valid ctor', function () {
      var SettingsFile = require('../lib');
      var settingsFile = new SettingsFile('test');

      expect(SettingsFile).to.be.a('function');
      expect(settingsFile).to.be.an.instanceof(SettingsFile);
      expect(settingsFile.delete).to.be.a('function');
      expect(settingsFile.deleteSync).to.be.a('function');
      expect(settingsFile.get).to.be.a('function');
      expect(settingsFile.getSync).to.be.a('function');
      expect(settingsFile.instance).to.be.a('function');
      expect(settingsFile.save).to.be.a('function');
      expect(settingsFile.saveSync).to.be.a('function');
      expect(settingsFile.set).to.be.a('function');
      expect(settingsFile.setSync).to.be.a('function');
    });
  });
});