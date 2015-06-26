'use strict';

var sinon = require('sinon');
var fs = require('fs');

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
  var jsonfile = {
    readFileSync: sinon.stub().throws('err'),
    readFile: sinon.stub().callsArgWith(1, 'err'),
    writeFileSync: sinon.stub(),
    writeFile: sinon.stub().callsArgWith(2, null)
  };

  fs.unlinkSync = sinon.stub().throws('err');
  fs.unlink = sinon.stub().callsArgWith(1, 'err');

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
