'use strict';

var expect = require('chai').expect;
var SettingsFile = require('../lib');

describe('settings-file', function () {
  describe('constractor', function () {
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
  });

  xdescribe('with valid parameters', function () {
    it('should', function () {});
  });

  xdescribe('#delete', function () {});

  describe('exports', function () {
    it('should expose a valid ctor', function () {
      expect(SettingsFile).to.be.a('function');
      var settingsFile = new SettingsFile('test');

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