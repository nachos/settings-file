'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var util = require('../util');

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

describe('global set', function () {
  describe('existing app', function () {
    var existContent = {
      global: {
        test: 'before',
        test2: 'test2'
      }
    };
    var content = {test: 'test'};
    var expected = {
      global: {
        test: content.test,
        test2: existContent.global.test2
      }
    };
    var settings;
    var jsonfile;

    beforeEach(function () {
      jsonfile = util.mockExisting(mockery, existContent).jsonfile;
      var SettingsFile = require('../../lib/index');

      settings = new SettingsFile('test');
    });

    it('should set only specific settings', function () {
      return settings.set(content).then(function () {
        expect(jsonfile.writeFile).to.have.been.calledWith(settings._path, expected);
      });
    });

    it('should set only specific settings - sync', function () {
      settings.setSync(content);
      expect(jsonfile.writeFileSync).to.have.been.calledWith(settings._path, expected);
    });

    afterEach(function () {
      util.unmock(mockery);
    });
  });

  describe('non existing app', function () {
    var content = {test: 'test'};
    var expected = {global: content};
    var settings;
    var jsonfile;

    beforeEach(function () {
      jsonfile = util.mockNotExisting(mockery).jsonfile;
      var SettingsFile = require('../../lib/index');

      settings = new SettingsFile('test');
    });

    it('should write to globals', function () {
      return settings.set(content).then(function () {
        expect(jsonfile.writeFile).to.have.been.calledWith(settings._path, expected);
      });
    });

    it('should write to globals - sync', function () {
      settings.setSync(content);
      expect(jsonfile.writeFileSync).to.have.been.calledWith(settings._path, expected);
    });

    afterEach(function () {
      util.unmock(mockery);
    });
  });
});