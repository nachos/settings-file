'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var util = require('./../util');
var uuid = require('node-uuid').v4();

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

describe('instance delete', function () {
  describe('existing app', function () {
    var existContent;
    var settings;
    var instance;
    var jsonfile;

    beforeEach(function () {
      existContent = { global: { test: 'test' } };
    });

    describe('existing instance', function () {
      var expected;

      beforeEach(function () {
        existContent.instances = {};
        existContent.instances[uuid] = { test: 'test' };
        expected = { global: { test: 'test' }, instances: {} };

        jsonfile = util.mockExisting(mockery, existContent).jsonfile;
        var SettingsFile = require('../../lib/index');

        settings = new SettingsFile('test');
        instance = settings.instance(uuid);
      });

      it('should remove the instance', function () {
        return instance.delete().then(function () {
          expect(jsonfile.writeFile).to.have.been.calledWith(settings._path, expected);
        });
      });

      it('should remove the instance - sync', function () {
        instance.deleteSync();
        expect(jsonfile.writeFileSync).to.have.been.calledWith(settings._path, expected);
      });

      afterEach(function () {
        util.unmock(mockery);
      });
    });

    describe('non existing instance', function () {
      beforeEach(function () {
        jsonfile = util.mockExisting(mockery, existContent).jsonfile;
        var SettingsFile = require('../../lib/index');

        settings = new SettingsFile('test');
        instance = settings.instance(uuid);
      });

      it('should not save', function () {
        return instance.delete().then(function () {
          expect(jsonfile.writeFile).to.not.have.been.called;
        });
      });

      it('should not save - sync', function () {
        instance.deleteSync();
        expect(jsonfile.writeFileSync).to.not.have.been.called;
      });

      afterEach(function () {
        util.unmock(mockery);
      });
    });
  });

  describe('non existing app', function () {
    var settings;
    var instance;
    var jsonfile;

    beforeEach(function () {
      jsonfile = util.mockNotExisting(mockery).jsonfile;
      var SettingsFile = require('../../lib/index');

      settings = new SettingsFile('test');
      instance = settings.instance(uuid);
    });

    it('should not save', function () {
      return instance.delete().then(function () {
        expect(jsonfile.writeFile).to.not.have.been.called;
      });
    });

    it('should not save - sync', function () {
      instance.deleteSync();
      expect(jsonfile.writeFileSync).to.not.have.been.called;
    });

    afterEach(function () {
      util.unmock(mockery);
    });
  });
});