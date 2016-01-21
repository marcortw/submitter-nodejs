process.env.DEBUG = "*";
var debug = require('debug');
var error = debug('acdp-submitter:error');

var log = debug('acdp-submitter:log');
// set this namespace to log via console.log
log.log = console.log.bind(console); // don't forget to bind to console!

// set all output to go via console.info
// overrides all per-namespace log settings
debug.log = console.info.bind(console);



module.exports = {
    debug: debug.log,
    error: error,
    info: log.log
};