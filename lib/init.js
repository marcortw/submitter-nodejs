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
            var JSONDemand = JSON.stringify(entry);
            validator.validate(JSONDemand, function (err, result) {
                if (err) {
                    logger.error('The following manually supplied demand was not valid: ' + JSON.stringify(entry));
                } else {
                    var d = new Demand(JSONDemand);
                    //logger.info(d);
                }
            })
        });
    }
};
