var config = require('nconf');
var path = require('path');
var logger = require('./logger.js');

var overrideFile = path.join(__dirname, '../conf/acdp.overrides.json');
var userFile = path.join(__dirname, '../../../acdp.config.json'); // the path above the parent module's node_modules
var defaultFile = path.join(__dirname, '../conf/acdp.defaults.json');

logger.debug('Override config file: ' + overrideFile);
logger.debug('User config file: ' + userFile);
logger.debug('Default config file: ' + defaultFile);

config.argv()
    .file('override', overrideFile)
    .file('user', userFile)
    .file('global', defaultFile);

module.exports = config;