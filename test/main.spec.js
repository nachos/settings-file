'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var util = require('./util');

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

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

describe('exports', function () {
  beforeEach(function () {
    util.mockExisting(mockery);
  });

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

  afterEach(function () {
    util.unmock(mockery);
  });
});