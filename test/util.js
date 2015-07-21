'use strict';

var sinon = require('sinon');
var fs = require('fs');

module.exports.instanceSettings = function (uuid, settings) {
  var template = {instances: {}};

  template.instances[uuid] = settings;

  return template;
};

module.exports.unmock = function (mockery) {
  mockery.deregisterMock('jsonfile');
  mockery.deregisterMock('fs');
  mockery.disable();
};

module.exports.mockExisting = function (mockery, content) {
  var jsonfile = {
    readFileSync: sinon.stub().returns(content),
    readFile: sinon.stub().callsArgWith(1, null, content),
    writeFileSync: sinon.stub(),
    writeFile: sinon.stub().callsArgWith(2, null)
  };

  fs.unlinkSync = sinon.stub();
  fs.unlink = sinon.stub().callsArgWith(1, null);

  mockery.registerMock('jsonfile', jsonfile);
  mockery.registerMock('fs', fs);

  mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false
  });

  return {
    jsonfile: jsonfile,
    fs: fs
  };
};

module.exports.mockNotExisting = function (mockery) {
  var enoent = new Error('err');
  enoent.code = 'ENOENT';

  var jsonfile = {
    readFileSync: sinon.stub().throws(enoent),
    readFile: sinon.stub().callsArgWith(1, enoent),
    writeFileSync: sinon.stub(),
    writeFile: sinon.stub().callsArgWith(2, null)
  };

  fs.unlinkSync = sinon.stub().throws(enoent);
  fs.unlink = sinon.stub().callsArgWith(1, enoent);

  mockery.registerMock('jsonfile', jsonfile);
  mockery.registerMock('fs', fs);

  mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false
  });

  return {
    jsonfile: jsonfile,
    fs: fs
  };
};

module.exports.mockFailing = function (mockery) {
  var error = new Error('err');

  var jsonfile = {
    readFileSync: sinon.stub().throws(error),
    readFile: sinon.stub().callsArgWith(1, error),
    writeFileSync: sinon.stub(),
    writeFile: sinon.stub().callsArgWith(2, null)
  };

  fs.unlinkSync = sinon.stub().throws(error);
  fs.unlink = sinon.stub().callsArgWith(1, error);

  mockery.registerMock('jsonfile', jsonfile);
  mockery.registerMock('fs', fs);

  mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false
  });

  return {
    jsonfile: jsonfile,
    fs: fs
  };
};
