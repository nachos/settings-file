var jf = require('jsonfile');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var nachosHome = require('nachos-home');
var defaults = require('defaults');
var uuid = require('node-uuid');
var isuuid = require('isuuid');
var _ = require('lodash');

jf.spaces = 2;

function SettingsFile(app, options) {
  this._path = nachosHome('data', app + '.json');
  this._options = defaults(options, {
    globalDefaults: {},
    instanceDefaults: {}
  });
}

SettingsFile.TEMPLATE = {global: {}, instances: {}};

SettingsFile.prototype._readFile = function (cb) {
  var self = this;

  fs.exists(self._path, function (exists) {
    if (exists) {
      return jf.readFile(self._path, cb);
    }

    cb(null, _.cloneDeep(SettingsFile.TEMPLATE));
  });
};

SettingsFile.prototype._readFileSync = function () {
  if (fs.existsSync(this._path)) {
    return jf.readFileSync(this._path);
  }

  return _.cloneDeep(SettingsFile.TEMPLATE);
};

SettingsFile.prototype._writeFile = function (contents, cb) {
  var self = this;

  mkdirp(path.dirname(self._path), function (err) {
    if (err) {
      return cb(err);
    }

    jf.writeFile(self._path, contents, cb);
  });
};

SettingsFile.prototype._writeFileSync = function (contents) {
  mkdirp.sync(path.dirname(this._path));
  jf.writeFileSync(this._path, contents);
};

SettingsFile.prototype.get = function (cb) {
  var self = this;
  self._readFile(function (err, data) {
    if (err) {
      return cb(err);
    }

    cb(null, defaults(data.global, self._options.globalDefaults));
  });
};

SettingsFile.prototype.getSync = function () {
  return this._readFileSync().global;
};

SettingsFile.prototype.save = function (contents, cb) {
  var self = this;

  self._readFile(function (err, fileContents) {
    if (err) {
      return cb(err);
    }

    fileContents.global = contents;

    self._writeFile(fileContents, cb);
  });
};

SettingsFile.prototype.saveSync = function (contents) {
  var fileContents = this._readFileSync();
  fileContents.global = contents;
  this._writeFileSync(fileContents);
};

SettingsFile.prototype.instance = function (id) {
  var self = this;

  if (id && !isuuid(id)) {
    // TODO: Better error
    throw new Error('Invalid id');
  }

  return {
    _id: id,
    get: function (cb) {
      var innerSelf = this;

      self._readFile(function (err, data) {
        if (err) {
          return cb(err);
        }

        cb(null, defaults(data.instances[innerSelf._id], self._options.instanceDefaults));
      });
    },
    getSync: function () {
      return self._readFileSync().instances[this._id];
    },
    save: function (contents, cb) {
      var innerSelf = this;

      self._readFile(function (err, fileContents) {
        if (err) {
          return cb(err);
        }

        if (!innerSelf._id) {
          innerSelf._id = uuid.v4();
        }

        fileContents.instances[innerSelf._id] = contents;

        self._writeFile(fileContents, cb);
      });
    },
    saveSync: function (contents) {
      if (!this._id) {
        this._id = uuid.v4();
      }

      var fileContents = self._readFileSync();
      fileContents.instances[this._id] = contents;
      self._writeFileSync(fileContents);
    }
  };
};

module.exports = SettingsFile;