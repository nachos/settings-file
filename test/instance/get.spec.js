'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var util = require('../util');
var uuid = require('node-uuid').v4();

chai.use(require('chai-as-promised'));

describe('instance get', function () {
  describe('existing app', function () {
    var instanceContent = {test: 'test'};
    var existContent = util.instanceSettings(uuid, instanceContent);
    var SettingsFile;

    beforeEach(function () {
      util.mockExisting(mockery, existContent);
      SettingsFile = require('../../lib/index');
    });

    describe('without defaults', function () {
      var expected = existContent.instances[uuid];
      var instance;

      beforeEach(function () {
        instance = new SettingsFile('test').instance(uuid);
      });

      it('should return the instance content', function () {
        return expect(instance.get()).to.eventually.eql(expected);
      });

      it('should return the instance content - sync', function () {
        expect(instance.getSync()).to.eql(expected);
      });
    });

    describe('with defaults', function () {
      var expected;
      var instance;
      var defaults;

      beforeEach(function () {
        defaults = {
          test: 'defaultTest',
          test2: 'defaultTest2'
        };
        instance = new SettingsFile('test', {
          instanceDefaults: defaults
        }).instance(uuid);
        expected = {
          test: instanceContent.test,
          test2: defaults.test2
        };
      });

      it('should return the instance content combined with defaults', function () {
        return expect(instance.get()).to.eventually.eql(expected);
      });

      it('should return the instance content combined with defaults - sync', function () {
        expect(instance.getSync()).to.eql(expected);
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
      var instance;

      beforeEach(function () {
        instance = new SettingsFile('test').instance(uuid);
      });

      it('should return empty json', function () {
        return expect(instance.get()).to.eventually.eql({});
      });

      it('should return empty json - sync', function () {
        expect(instance.getSync()).to.eql({});
      });
    });

    describe('with defaults', function () {
      var instance;
      var defaults;

      beforeEach(function () {
        defaults = {
          test: 'defaultTest',
          test2: 'defaultTest2'
        };
        instance = new SettingsFile('exists', {
          instanceDefaults: defaults
        }).instance(uuid);
      });

      it('should return the defaults', function () {
        return expect(instance.get()).to.eventually.eql(defaults);
      });

      it('should return the defaults - sync', function () {
        expect(instance.getSync()).to.eql(defaults);
      });
    });

    afterEach(function () {
      util.unmock(mockery);
    });
  });
});