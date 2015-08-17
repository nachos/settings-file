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
var debug = require('debug')('nachosSettingsFile');

jf.spaces = 2;

/**
 * Nachos settings file
 * @param app The name of the app
 * @param options Optional templates for global and instance settings
 * @constructor
 */
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

/**
 * Read the file contents
 * @returns {Q.promise} the file contents
 * @private
 */
SettingsFile.prototype._readFile = function () {
  var self = this;

  return Q.ninvoke(jf, 'readFile', self._path)
    .catch(function (err) {
      if (err.code === 'ENOENT') {
        return Q.resolve({});
      }

      debug('_readFile error for app: %s - %s', self._app, err);

      return Q.reject(err);
    });
};

/**
 * Read the file contents
 * @returns {object} the file contents
 * @private
 */
SettingsFile.prototype._readFileSync = function () {
  try {
    return jf.readFileSync(this._path);
  }
  catch (err) {
    if (err.code === 'ENOENT') {
      debug('_readFile got empty file for app: %s', this._app);

      return {};
    }

    debug('_readFile error for app: %s - %s', this._app, err);
    throw err;
  }
};

/**
 * Write data to the file
 * @param content The data to write to the file
 * @returns {Q.promise} promise to finish writing
 * @private
 */
SettingsFile.prototype._writeFile = function (content) {
  var self = this;

  return Q.nfcall(mkdirp, path.dirname(self._path)).then(function () {
    return Q.ninvoke(jf, 'writeFile', self._path, content);
  });
};

/**
 * Write data to the file
 * @param content The data to write to the file
 * @private
 */
SettingsFile.prototype._writeFileSync = function (content) {
  mkdirp.sync(path.dirname(this._path));
  jf.writeFileSync(this._path, content);
};

/**
 * Read the global settings
 * @returns {Q.promise} The global settings
 */
SettingsFile.prototype.get = function () {
  var self = this;

  return self._readFile()
    .then(function (data) {
      return defaults(data.global, self._options.globalDefaults);
    });
};

/**
 * Read the global settings
 * @returns {object} The global settings
 */
SettingsFile.prototype.getSync = function () {
  return defaults(this._readFileSync().global, this._options.globalDefaults);
};

/**
 * Save the global settings
 * @param content The global settings
 * @returns {Q.promise} promise to finish saving
 */
SettingsFile.prototype.save = function (content) {
  var self = this;

  return self._readFile()
    .then(function (fileContent) {
      fileContent.global = content;

      return self._writeFile(fileContent);
    });
};

/**
 * Save the global settings
 * @param content The global settings
 */
SettingsFile.prototype.saveSync = function (content) {
  var fileContent = this._readFileSync();

  fileContent.global = content;
  this._writeFileSync(fileContent);
};

/**
 * Set values to the global settings
 * @param content The values to set
 * @returns {Q.promise} promise to finish saving
 */
SettingsFile.prototype.set = function (content) {
  var self = this;

  return self._readFile()
    .then(function (fileContent) {
      fileContent.global = _.merge(fileContent.global || {}, content);

      return self._writeFile(fileContent);
    });
};

/**
 * Set values to the global settings
 * @param content The values to set
 */
SettingsFile.prototype.setSync = function (content) {
  var fileContent = this._readFileSync();

  fileContent.global = _.merge(fileContent.global || {}, content);
  this._writeFileSync(fileContent);
};

/**
 * Delete the file
 * @returns {Q.promise} promise to finish deleting
 */
SettingsFile.prototype.delete = function () {
  var self = this;

  return Q.nfcall(fs.unlink, self._path)
    .catch(function (err) {
      if (err.code === 'ENOENT') {
        return;
      }

      debug('delete error for app: %s - %s', self._app, err);

      return Q.reject(err);
    });
};

/**
 * Delete the file
 */
SettingsFile.prototype.deleteSync = function () {
  try {
    fs.unlinkSync(this._path);
  }
  catch (err) {
    if (err.code === 'ENOENT') {
      return;
    }

    debug('delete error for app: %s - %s', this._app, err);
    throw err;
  }
};

/**
 * Builds an instance object with the given uuid
 * @param id the uuid of the wanted instance
 * @returns {object} An instance object
 */
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
    /**
     * Read the instance settings
     * @returns {Q.promise} The instance settings
     */
    get: function () {
      var innerSelf = this;

      return self._readFile()
        .then(function (fileContent) {
          return defaults((fileContent.instances || {})[innerSelf._id], self._options.instanceDefaults);
        });
    },
    /**
     * Read the instance settings
     * @returns {object} The instance settings
     */
    getSync: function () {
      var fileContent = self._readFileSync();

      return defaults((fileContent.instances || {})[this._id], self._options.instanceDefaults);
    },
    /**
     * Save the instance settings
     * @param content The instance settings
     * @returns {Q.promise} promise to finish saving
     */
    save: function (content) {
      var innerSelf = this;

      return self._readFile()
        .then(function (fileContent) {
          fileContent.instances = fileContent.instances || {};
          fileContent.instances[innerSelf._id] = content;

          return self._writeFile(fileContent);
        });
    },
    /**
     * Save the instance settings
     * @param content The instance settings
     */
    saveSync: function (content) {
      var fileContent = self._readFileSync();

      fileContent.instances = fileContent.instances || {};
      fileContent.instances[this._id] = content;
      self._writeFileSync(fileContent);
    },
    /**
     * Set values to the instance settings
     * @param content The values to set
     * @returns {Q.promise} promise to finish saving
     */
    set: function (content) {
      var innerSelf = this;

      return self._readFile()
        .then(function (fileContent) {
          fileContent.instances = fileContent.instances || {};
          fileContent.instances[innerSelf._id] = _.assign(fileContent.instances[innerSelf._id] || {}, content);

          return self._writeFile(fileContent);
        });
    },
    /**
     * Set values to the instance settings
     * @param content The values to set
     */
    setSync: function (content) {
      var fileContent = self._readFileSync();

      fileContent.instances = fileContent.instances || {};
      fileContent.instances[this._id] = _.assign(fileContent.instances[this._id] || {}, content);
      self._writeFileSync(fileContent);
    },
    /**
     * Delete the instance
     * @returns {Q.promise} promise to finish deleting
     */
    delete: function () {
      var innerSelf = this;

      return self._readFile()
        .then(function (fileContent) {
          if (fileContent.instances && fileContent.instances[innerSelf._id]) {
            delete fileContent.instances[innerSelf._id];

            return self._writeFile(fileContent);
          }
          else {
            debug('delete instance %s not exists for app: %s', innerSelf._id, self._app);
          }
        });
    },
    /**
     * Delete the instance
     */
    deleteSync: function () {
      var fileContent = self._readFileSync();

      if (fileContent.instances && fileContent.instances[this._id]) {
        delete fileContent.instances[this._id];

        self._writeFileSync(fileContent);
      }
      else {
        debug('deleteSync instance %s not exists for app: %s', this._id, self._app);
      }
    }
  };
};

module.exports = SettingsFile;