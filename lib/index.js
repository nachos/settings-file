var jf = require('jsonfile');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var nachosHome = require('nachos-home');

function SettingsFile(app) {
  this._path = nachosHome('data', app + '.json');
}

SettingsFile.TEMPLATE = {global: {}, instances: {}};

SettingsFile.prototype._readFile = function (cb) {
  var self = this;
  fs.exists(self._path, function (exists) {
    if (exists) {
      return jf.readFile(self._path, cb);
    }

    cb(null, SettingsFile.TEMPLATE);
  });
};

SettingsFile.prototype._readFileSync = function () {
  if (fs.existsSync(this._path)) {
    return jf.readFileSync(this._path);
  }

  return SettingsFile.TEMPLATE;
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
  mkdirp.sync(path.dirname(self._path));
  jf.writeFileSync(self._path, contents);
};


SettingsFile.prototype.get = function (cb) {
  this._readFile(function (err, data) {
    if (err) {
      return cb(err);
    }

    cb(null, data.global);
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

  return {
    _id: id,
    get: function (cb) {
      var innerSelf = this;
      self._readFile(function (err, data) {
        if (err) {
          return cb(err);
        }

        cb(null, data.instances[innerSelf._id]);
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

        fileContents.instances[innerSelf._id] = contents;

        self._writeFile(fileContents, cb);
      });
    },
    saveSync: function (contents) {
      var fileContents = self._readFileSync();
      fileContents.instances[this._id] = contents;
      self._writeFileSync(fileContents);
    }
  };
};

module.exports = SettingsFile;