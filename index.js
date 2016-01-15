var async = require('async');
var constants = require('./lib/constants');
var logger = require('./lib/logger.js');
var acdpinit = require('./lib/init.js');
var Request = require('./lib/model/Request.js');
var classifier = require('./lib/classifier');
var Consumer = require('./lib/model/Consumer');
var Producer = require('./lib/model/Producer');
var L3ep = require('./lib/model/Layer3Endpoint');
var L4ep = require('./lib/model/Layer4Endpoint');
var L7ep = require('./lib/model/Layer7Endpoint');
var config = require('./lib/configloader');


//var api = require('./lib/api.js');

var Acdp = function () {
    var agentVersion = require('./package.json').version
    logger.info("Starting ACDP Submitter for Node.js version %s.", agentVersion);

    acdpinit.initialize(function (err, result) {
        if (err) {
            logger.error(err)
        } else {
            logger.info('ACDP initialization successful');
        }
    });
};

produce = function (endpoints, forConsumers) {
    console.log('Produce in api!');
};

/**
 *
 * @param endpoints
 * @param fromProducers Array
 * @param description
 */
consumeSpecific = function (endpoints, fromProducers, description) {
    console.log('Consume in api! Endpoints:' + JSON.stringify(endpoints));

    endpoints.forEach(function (entry) {
        try {
            var retObj = classifier.validateShorthand(entry);
            logger.debug(JSON.stringify(retObj));
        }
        catch (err) {
            logger.error(err.message);
        }
    });

    var consumerObj = new Consumer();
    consumerObj.addProducer()

    var dObj = new Request();
    dObj.request = {
        'consumer': {
            'description': description,
            'consumes': [],
            'fromProducers': []
        }
    };
    //var objProducer = Request.defineProp(demand, 'producer', {
    //    'description': description,
    //    'produces': [],
    //    'forConsumers': []
    //});
    //demand.consumer.consumes = [];
    dObj.request.consumer.consumes.push({'endpoint': {'layer4Endpoint': {"applications": [endpoints]}}});
    var result = dObj.validateAndSend(function (err, results) {
        if (err) {
            logger.error('Problem encountered at Request creation.');
        }
    });

};

consumePattern = function (pattern) {
    //var demandA = new Request();
    //Request.showCount();
    //Request.defineProp(demandA,"a","b");
    //demandA.defineProp(demandA,"a","b");

    //var demandB = new Request();
    //demandB.defineProp(demandB,"c","d");

};

consumeApplication = function (application) {

};

consume = function (acdpShorthands, callback) {
    var reqObj = new Request();

    if (acdpShorthands.constructor === Array) {
        acdpShorthands.forEach(function (acdpShorthand) {
            parse(acdpShorthand, function (err, consumerOrProducer) {
                if (err) {
                    logger.error(err);
                    if (callback) callback(err)
                } else {
                    reqObj.addDemand(consumerOrProducer);
                }
            });
        });
    } else {
        console.log('single obj');
        parse(acdpShorthands, function (err, consumerOrProducer) {
            if (err) {
                logger.error(err);
                if (callback) callback(err)
            } else {
                reqObj.addDemand(consumerOrProducer);
            }
        });
    }

    function parse(shorthand, callback) {
        logger.debug(Object.keys(shorthand).length);
        if (Object.keys(shorthand).length > 2) {
            throw new Error('Invalid number of key-value pairs');
        }

        // We have only one key value pair
        if (Object.keys(shorthand).length == 1) {
            for (var key in shorthand) {
                var value = shorthand[key];
                switch (key.toUpperCase()) {
                    case "URL":
                        classifier.objectsFromUrl(value, function (err, results) {
                            if (err) {
                                callback(err, null);
                            } else {
                                var l3Obj = results[0];
                                var l4Obj = results[1];
                                var consObj = new Consumer();
                                consObj.addProducer(l3Obj);
                                consObj.addProduct(l4Obj);
                                callback(null, consObj);
                            }
                        });
                        break;


                    case "APP":
                        var l4Obj = new L4ep();
                        l4Obj.addSpecial(constants.SPECIAL_ANY);

                        var l7Obj = new L7ep();
                        l7Obj.addApplication(value)

                        var consObj = new Consumer();
                        consObj.addProduct(l4Obj);
                        consObj.addProducer(l7Obj);
                        callback(null, consObj);
                        break;


                    case "IP":
                        break;

                    case "FOR":
                    case "FROM":
                        if (callback) callback(new Error('The "FOR" and "FROM" keys can only be used together with another key.'), null);
                        break;

                    default:
                        var errMsg = 'Invalid key supplied: ' + key;
                        logger.error(errMsg);
                        if (callback) callback(new Error(errMsg), null);
                }
            }
        }

        // We have exactly two key value pairs
        if (Object.keys(shorthand).length == 2) {

        }
    }

    reqObj.validateAndSend(function (err, result) {
        if (err) {
            logger.error(err)
            if (callback) callback(err, null);
        } else {
            if (callback) callback(null, result);
        }
    })
};

module.exports = {
    Acdp: new Acdp,
    consumeSpecific: consumeSpecific,
    consumePattern: consumePattern,
    consumeApplication: consumeApplication,
    produce: produce,
    consume: consume
};