'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var util = require('../util');

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

describe('global delete', function () {
  describe('existing app', function () {
    var settings;
    var fs;

    beforeEach(function () {
      fs = util.mockExisting(mockery).fs;
      var SettingsFile = require('../../lib/index');

      settings = new SettingsFile('test');
    });

    it('should delete settings', function () {
      return settings.delete()
        .then(function () {
          expect(fs.unlink).to.have.been.calledWith(settings._path);
        });
    });

    it('should delete settings - sync', function () {
      settings.deleteSync();
      expect(fs.unlinkSync).to.have.been.calledWith(settings._path);
    });

    afterEach(function () {
      util.unmock(mockery);
    });
  });

  describe('non existing app', function () {
    var settings;
    var fs;

    beforeEach(function () {
      fs = util.mockNotExisting(mockery).fs;
      var SettingsFile = require('../../lib/index');

      settings = new SettingsFile('test');
    });

    it('should delete settings', function () {
      return settings.delete()
        .then(function () {
          expect(fs.unlink).to.have.been.calledWith(settings._path);
        });
    });

    it('should delete settings - sync', function () {
      settings.deleteSync();
      expect(fs.unlinkSync).to.have.been.calledWith(settings._path);
    });

    afterEach(function () {
      util.unmock(mockery);
    });
  });

  describe('failing', function () {
    var settings;
    var fs;

    beforeEach(function () {
      fs = util.mockFailing(mockery).fs;
      var SettingsFile = require('../../lib/index');

      settings = new SettingsFile('test');
    });

    it('should fail to delete settings', function () {
      return expect(settings.delete()).to.eventually.be.rejected;
    });

    it('should fail to delete settings - sync', function () {
      var fn = function () {
        settings.deleteSync();
      };

      expect(fn).to.throw();
    });

    afterEach(function () {
      util.unmock(mockery);
    });
  });
});