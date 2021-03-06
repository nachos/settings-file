# settings-file

Settings file is a tool to handle nachos settings files

<table>
  <thead>
    <tr>
      <th>Linux</th>
      <th>OSX</th>
      <th>Windows</th>
      <th>Coverage</th>
      <th>Dependencies</th>
      <th>DevDependencies</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2" align="center">
        <a href="https://travis-ci.org/nachos/settings-file"><img src="https://img.shields.io/travis/nachos/settings-file.svg?style=flat-square"></a>
      </td>
      <td align="center">
        <a href="https://ci.appveyor.com/project/nachos/settings-file"><img src="https://img.shields.io/appveyor/ci/nachos/settings-file.svg?style=flat-square"></a>
      </td>
      <td align="center">
<a href='https://coveralls.io/r/nachos/settings-file'><img src='https://img.shields.io/coveralls/nachos/settings-file.svg?style=flat-square' alt='Coverage Status' /></a>
      </td>
      <td align="center">
        <a href="https://david-dm.org/nachos/settings-file"><img src="https://img.shields.io/david/nachos/settings-file.svg?style=flat-square"></a>
      </td>
      <td align="center">
        <a href="https://david-dm.org/nachos/settings-file#info=devDependencies"><img src="https://img.shields.io/david/dev/nachos/settings-file.svg?style=flat-square"/></a>
      </td>
    </tr>
  </tbody>
</table>

## Have a problem? Come chat with us!
[![Join the chat at https://gitter.im/nachos/settings-file](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nachos/settings-file?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Installation
``` bash
  $ [sudo] npm install settings-file --save
```

## Examples
### Initialize
``` js
var SettingsFile = require('settings-file');

// Wraps /path/to/user/home/.nachos/data/test.json file
var settingsFile = new SettingsFile('test'); 

// Provide default settings
var settingsFile = new SettingsFile('test', {
    globalDefaults: {color: 'blue'},
    instanceDefaults: {color: 'red'}
  }); 
```

### Global Settings
``` js
// Read global settings
settingsFile.get()
  .then(function(settings) {
    // do stuff with settings
  });
  
// Set selective fields
// file contents before: {color: 'blue', name: 'nacho'}
settingsFile.set({name: 'nyancat'})
  .then(function() {
    // saved!
    // file contents after: {color: 'blue', name: 'nyancat'}
  });
  
// Save settings (replaces existing settings)
// file contents before: {color: 'blue', name: 'nacho'}
settingsFile.save({name: 'nyancat'})
  .then(function() {
    // saved!
    // file contents after: {name: 'nyancat'}
  });
  
// Delete the file
settings.delete()
  .then(function () {
    // deleted!
  });
```

### Instance Settings
``` js
// Read instance settings
settingsFile
  .instance(uuid)
  .get()
  .then(function(settings) {
    // do stuff with settings
  });
  
// Set selective fields
// instance contents before: {color: 'red', name: 'nacho'}
settingsFile
  .instance(uuid)
  .set({name: 'nyancat'})
  .then(function() {
    // saved!
    // instance contents after: {color: 'red', name: 'nyancat'}
  });
  
// Save settings (replaces existing settings)
// instance contents before: {color: 'red', name: 'nacho'}
settingsFile
  .instance(uuid)
  .save({name: 'nyancat'})
  .then(function() {
    // saved!
    // instance contents after: {name: 'nyancat'}
  });
  
// Delete the instance  
settings
  .instance(uuid)
  .delete()
  .then(function () {
    // deleted!
  });
```

## Run Tests
``` bash
  $ npm test
```

## License

[MIT](LICENSE)
