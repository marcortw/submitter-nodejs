var logger = require('./logger');
var config = require('./configloader');
var validator = require('./acdpDraft01');
var Demand = require('./Demand');

module.exports = {
    initialize: function () {
        logger.debug(
            'Loading ACDP-Submitter from %s',
            __dirname
        );

        logger.debug("CONFIGURATION: " + JSON.stringify(config.get()));

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
    }
};
