'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var util = require('../util');

chai.use(require('chai-as-promised'));

describe('global get', function () {
  describe('existing app', function () {
    var test = { global: { test: 'test' } };
    var SettingsFile;

    beforeEach(function () {
      util.mockExisting(mockery, test);
      SettingsFile = require('../../lib/index');
    });

    describe('without defaults', function () {
      var settings;

      beforeEach(function () {
        settings = new SettingsFile('test');
      });

      it('should return the global content', function () {
        return expect(settings.get()).to.eventually.eql(test.global);
      });

      it('should return the global content - sync', function () {
        expect(settings.getSync()).to.eql(test.global);
      });
    });

    describe('with defaults', function () {
      var expected;
      var settings;
      var defaults;

      beforeEach(function () {
        defaults = {
          test: 'defaultTest',
          test2: 'defaultTest2'
        };
        settings = new SettingsFile('test', {
          globalDefaults: defaults
        });
        expected = { test: test.global.test, test2: defaults.test2 };
      });

      it('should return the global content combined with defaults', function () {
        return expect(settings.get()).to.eventually.eql(expected);
      });

      it('should return the global content combined with defaults - sync', function () {
        expect(settings.getSync()).to.eql(expected);
      });
    });

    afterEach(function () {
      util.unmock(mockery);
    });
  });

  describe('non existing app', function () {
    var SettingsFile;

    beforeEach(function () {
      util.mockNotExisting(mockery);
      SettingsFile = require('../../lib/index');
    });

    describe('without defaults', function () {
      var settings;

      beforeEach(function () {
        settings = new SettingsFile('test');
      });

      it('should return empty json', function () {
        return expect(settings.get()).to.eventually.eql({});
      });

      it('should return empty json - sync', function () {
        expect(settings.getSync()).to.eql({});
      });
    });

    describe('with defaults', function () {
      var settings;
      var defaults;

      beforeEach(function () {
        defaults = {
          test: 'defaultTest',
          test2: 'defaultTest2'
        };
        settings = new SettingsFile('exists', {
          globalDefaults: defaults
        });
      });

      it('should return the defaults', function () {
        return expect(settings.get()).to.eventually.eql(defaults);
      });

      it('should return the defaults - sync', function () {
        expect(settings.getSync()).to.eql(defaults);
      });
    });

    afterEach(function () {
      util.unmock(mockery);
    });
  });
});