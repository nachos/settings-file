'use strict';

var Q = require('q');
var jf = require('jsonfile');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var nachosHome = require('nachos-home');
var defaults = require('defaults');
var uuid = require('node-uuid');
var isuuid = require('isuuid');
var _ = require('lodash');
var debug = require('debug')('nachos:settings:file');

jf.spaces = 2;

function SettingsFile(app, options) {
  if (!app) {
    throw new TypeError('SettingsFile must accept an app name');
  }
  else if (typeof app !== 'string') {
    throw new TypeError('app name must be a string');
  }

  debug('initialize new settings file for app: %s', app);
  this._path = nachosHome('data', app + '.json');
  debug('resolved path is %s', this._path);
  this._options = defaults(options, {
    globalDefaults: {},
    instanceDefaults: {}
  });
}

SettingsFile.prototype._readFile = function () {
  return Q.nfcall(jf.readFile, this._path).catch(function () {
    return {};
  });
};

SettingsFile.prototype._readFileSync = function () {
  try {
    return jf.readFileSync(this._path);
  }
  catch (e) {
    return {};
  }
};

SettingsFile.prototype._writeFile = function (content) {
  var self = this;

  return Q.nfcall(mkdirp, path.dirname(self._path)).then(function () {
    return Q.nfcall(jf.writeFile, self._path, content);
  });
};

SettingsFile.prototype._writeFileSync = function (content) {
  mkdirp.sync(path.dirname(this._path));
  jf.writeFileSync(this._path, content);
};

SettingsFile.prototype.get = function () {
  var self = this;

  return self._readFile().then(function (data) {
    return defaults(data.global, self._options.globalDefaults);
  });
};

SettingsFile.prototype.getSync = function () {
  return defaults(this._readFileSync().global, this._options.globalDefaults);
};

SettingsFile.prototype.save = function (content) {
  var self = this;

  return self._readFile().then(function (fileContent) {
    fileContent.global = content;

    return self._writeFile(fileContent);
  });
};

SettingsFile.prototype.saveSync = function (content) {
  var fileContent = this._readFileSync();

  fileContent.global = content;
  this._writeFileSync(fileContent);
};

SettingsFile.prototype.set = function (content) {
  var self = this;

  return self._readFile().then(function (fileContent) {
    fileContent.global = _.assign(fileContent.global || {}, content);

    return self._writeFile(fileContent);
  });
};

SettingsFile.prototype.setSync = function (content) {
  var fileContent = this._readFileSync();

  fileContent.global = _.assign(fileContent.global || {}, content);
  this._writeFileSync(fileContent);
};

SettingsFile.prototype.instance = function (id) {
  var self = this;

  if (id && !isuuid(id)) {
    // TODO: Better error
    throw new Error('Invalid id');
  }

  return {
    _id: id,
    get: function () {
      var innerSelf = this;

      return self._readFile().then(function (fileContent) {
        return defaults(fileContent.instances[innerSelf._id], self._options.instanceDefaults);
      });
    },
    getSync: function () {
      return self._readFileSync().instances[this._id];
    },
    save: function (content) {
      var innerSelf = this;

      self._readFile().then(function (fileContent) {
        if (!innerSelf._id) {
          innerSelf._id = uuid.v4();
        }

        fileContent.instances[innerSelf._id] = content;

        return self._writeFile(fileContent);
      });
    },
    saveSync: function (content) {
      if (!this._id) {
        this._id = uuid.v4();
      }

      var fileContents = self._readFileSync();

      fileContents.instances[this._id] = content;
      self._writeFileSync(fileContents);
    },
    set: function (content) {
      var innerSelf = this;

      self._readFile().then(function (fileContent) {
        if (!innerSelf._id) {
          innerSelf._id = uuid.v4();
        }

        _.assign(fileContent.instances[this._id], content);

        return self._writeFile(fileContent);
      });
    },
    setSync: function (content) {
      if (!this._id) {
        this.saveSync(content);

        return;
      }

      var fileContent = self._readFileSync();

      _.assign(fileContent.instances[this._id], content);
      self._writeFileSync(fileContent);
    }
  };
};

// TODO: instance delete
// TODO: no instances in template

SettingsFile.prototype.delete = function () {
  var self = this;

  return Q.nfcall(fs.unlink, self._path).catch(function () {
    return null;
  });
};

SettingsFile.prototype.deleteSync = function () {
  try {
    fs.unlinkSync(this._path);
  }
  catch (e) { }
};

module.exports = SettingsFile;