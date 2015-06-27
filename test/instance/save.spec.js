'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var util = require('./../util');
var uuid = require('node-uuid').v4();

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

describe('instance save', function () {
  describe('existing app', function () {
    var existContent = util.instanceSettings(uuid, { test: 'before', test2: 'test2'});
    var content = { test: 'test' };
    var expected = util.instanceSettings(uuid, content);
    var settings;
    var instance;
    var jsonfile;

    beforeEach(function () {
      jsonfile = util.mockExisting(mockery, existContent).jsonfile;
      var SettingsFile = require('../../lib/index');

      settings = new SettingsFile('test');
      instance = settings.instance(uuid);
    });

    it('should override instance', function () {
      return instance.save(content).then(function () {
        expect(jsonfile.writeFile).to.have.been.calledWith(settings._path, expected);
      });
    });

    it('should override instance - sync', function () {
      instance.saveSync(content);
      expect(jsonfile.writeFileSync).to.have.been.calledWith(settings._path, expected);
    });

    afterEach(function () {
      util.unmock(mockery);
    });
  });

  describe('non existing app', function () {
    var content = { test: 'test' };
    var expected = util.instanceSettings(uuid, content);
    var settings;
    var instance;
    var jsonfile;

    beforeEach(function () {
      jsonfile = util.mockNotExisting(mockery).jsonfile;
      var SettingsFile = require('../../lib/index');

      settings = new SettingsFile('test');
      instance = settings.instance(uuid);
    });

    it('should write to instance', function () {
      return instance.save(content).then(function () {
        expect(jsonfile.writeFile).to.have.been.calledWith(settings._path, expected);
      });
    });

    it('should write to instance - sync', function () {
      instance.saveSync(content);
      expect(jsonfile.writeFileSync).to.have.been.calledWith(settings._path, expected);
    });

    afterEach(function () {
      util.unmock(mockery);
    });
  });
});