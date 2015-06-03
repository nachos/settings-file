var jf = require('jsonfile');
var fs = require('fs');

function SettingsFile(path) {
  this._path = path;
}

SettingsFile.TEMPLATE = { global: {}, instances: {} };

SettingsFile.prototype._readFile = function(cb) {
  var self = this;
  fs.exists(self._path, function (exists) {
    if (exists) {
      return jf.readFile(self._path, cb);
    }

    cb(null, SettingsFile.TEMPLATE);
  });
};

SettingsFile.prototype._readFileSync = function() {
    if (fs.existsSync(this._path)) {
      return jf.readFileSync(this._path);
    }

    return SettingsFile.TEMPLATE;
};

SettingsFile.prototype.get = function(cb) {
  this._readFile(function(err, data){
    if(err) {
      return cb(err);
    }

    cb(null, data.global);
  });
};

SettingsFile.prototype.getSync = function() {
  return this._readFileSync().global;
};

SettingsFile.prototype.save = function(contents, cb) {

};

SettingsFile.prototype.saveSync = function(contents) {

};

SettingsFile.prototype.instance = function(id) {
  var self = this;

  return {
    _id: id,
    get: function(cb){
      var innerSelf = this;
      self._readFile(function(err, data){
        if(err) {
          return cb(err);
        }

        cb(null, data.instances[innerSelf._id]);
      });
    }
  };
};

module.exports = SettingsFile;