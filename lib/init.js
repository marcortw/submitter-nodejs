var logger = require('./logger');
var config = require('./configloader');
var validator = require('./acdpDraft01');
var uuid = require('node-uuid');
var Demand = require('./model/Request');

module.exports = {
    initialize: function (callback) {
        logger.debug(
            'Loading ACDP-Submitter from %s',
            __dirname
        );

        logger.debug("CONFIGURATION: " + JSON.stringify(config.get()));

        // set the instance id
        if (config.get('application:instanceid:random')) {
            config.set('application:instanceid:value', uuid.v4());
        }

        var manualDemands = config.get('demands');

        manualDemands.forEach(function (entry) {
            var d = new Demand(entry);
            d.validateAndSend(function (err, result) {
                if (err) {
                    // TODO: Check deletion / gc
                    logger.error(err.message);
                }
            });
        });

        callback(null,true);
    }
};
