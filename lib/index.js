'use strict';

var Q = require('q');
var jf = require('jsonfile');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var nachosHome = require('nachos-home');
var defaults = require('defaults');
var isuuid = require('isuuid');
var _ = require('lodash');
var debug = require('debug')('nachos:settings-file');

jf.spaces = 2;

function SettingsFile(app, options) {
  if (!app) {
    throw new TypeError('SettingsFile must accept an app name');
  }
  else if (typeof app !== 'string') {
    throw new TypeError('SettingsFile app name must be a string');
  }

  debug('initialize new settings file for app: %s', app);
  this._app = app;
  this._path = nachosHome('data', app + '.json');
  debug('resolved path is %s', this._path);
  this._options = defaults(options, {
    globalDefaults: {},
    instanceDefaults: {}
  });
}

SettingsFile.prototype._readFile = function () {
  var self = this;

  return Q.nfcall(jf.readFile, self._path).catch(function (err) {
    debug('_readFile error for app: %s - %s', self._app, err);

    return {};
  });
};

SettingsFile.prototype._readFileSync = function () {
  try {
    return jf.readFileSync(this._path);
  }
  catch (err) {
    debug('_readFile error for app: %s - %s', this._app, err);

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

  if (!id) {
    throw new TypeError('SettingsFile instance must accept an id');
  }
  else if (!isuuid(id)) {
    throw new TypeError('SettingsFile instance id must be a uuid');
  }

  debug('initialize new instance for app: %s, instance: %s', this._app, id);

  return {
    _id: id,
    get: function () {
      var innerSelf = this;

      return self._readFile().then(function (fileContent) {
        return defaults((fileContent.instances || {})[innerSelf._id], self._options.instanceDefaults);
      });
    },
    getSync: function () {
      var fileContent = self._readFileSync();

      return defaults((fileContent.instances || {})[this._id], self._options.instanceDefaults);
    },
    save: function (content) {
      var innerSelf = this;

      return self._readFile().then(function (fileContent) {
        fileContent.instances = fileContent.instances || {};
        fileContent.instances[innerSelf._id] = content;

        return self._writeFile(fileContent);
      });
    },
    saveSync: function (content) {
      var fileContent = self._readFileSync();

      fileContent.instances = fileContent.instances || {};
      fileContent.instances[this._id] = content;
      self._writeFileSync(fileContent);
    },
    set: function (content) {
      var innerSelf = this;

      return self._readFile().then(function (fileContent) {
        fileContent.instances = fileContent.instances || {};
        fileContent.instances[innerSelf._id] = _.assign(fileContent.instances[innerSelf._id] || {}, content);

        return self._writeFile(fileContent);
      });
    },
    setSync: function (content) {
      var fileContent = self._readFileSync();

      fileContent.instances = fileContent.instances || {};
      fileContent.instances[this._id] = _.assign(fileContent.instances[this._id] || {}, content);
      self._writeFileSync(fileContent);
    }
  };
};

SettingsFile.prototype.delete = function () {
  var self = this;

  return Q.nfcall(fs.unlink, self._path).catch(function (err) {
    debug('delete error for app: %s - %s', self._app, err);

    return null;
  });
};

SettingsFile.prototype.deleteSync = function () {
  try {
    fs.unlinkSync(this._path);
  }
  catch (err) {
    debug('deleteSync error for app: %s - %s', this._app, err);
  }
};

module.exports = SettingsFile;