//process.env.DEBUG = "*";
var logger = require('debug');


var error = logger('acdp-submitter:error');

var info = logger('acdp-submitter:info');
// set this namespace to log via console.log
info.log = console.log.bind(console); // don't forget to bind to console!

var debug = logger('acdp-submitter:debug');
var trace = logger('acdp-submitter:trace');

// set all output to go via console.info
// overrides all per-namespace log settings
logger.log = console.info.bind(console);



module.exports = {
    trace: trace,
    debug: debug,
    error: error,
    info: info
};