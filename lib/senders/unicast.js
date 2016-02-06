var requestify = require('requestify');
var logger = require('../logger.js');
var http = require('http');

module.exports = {
    sendUnicast: function (options, msgObject, callback) {
        requestify.post(options.dstProto + '://' + options.dstHost + ':' + options.dstPort + options.dstPath, msgObject)
            .then(function (response) {
                logger.debug(response.getBody());
                callback(null, response.getBody());
            })
            .catch(function (error) {
                callback(error);
            })
            .done();
    }
};