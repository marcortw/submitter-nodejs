var url = require('url');
var async = require('async');
var logger = require('./lib/logger.js');
var acdpinit = require('./lib/init.js');
var Demand = require('./lib/Demand.js');
var classifier = require('./lib/classifier');
var Consumer = require('./lib/model/Consumer');
var Producer = require('./lib/model/Producer');
var L3ep = require('./lib/model/Layer3Endpoint');
var L4ep = require('./lib/model/Layer4Endpoint');


//var api = require('./lib/api.js');

var Acdp = function () {
    var agentVersion = require('./package.json').version
    logger.info("Starting ACDP Submitter for Node.js version %s.", agentVersion);

    acdpinit.initialize(function(err,result){
        if(err){
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

    var dObj = new Demand();
    dObj.demand = {
        'consumer': {
            'description': description,
            'consumes': [],
            'fromProducers': []
        }
    };
    //var objProducer = Demand.defineProp(demand, 'producer', {
    //    'description': description,
    //    'produces': [],
    //    'forConsumers': []
    //});
    //demand.consumer.consumes = [];
    dObj.demand.consumer.consumes.push({'endpoint': {'layer4Endpoint': {'ports': [endpoints]}}});
    var result = dObj.validateAndSend(function (err, results) {
        if (err) {
            logger.error('Problem encountered at Demand creation.');
        }
    });

};

consumePattern = function (pattern) {
    //var demandA = new Demand();
    //Demand.showCount();
    //Demand.defineProp(demandA,"a","b");
    //demandA.defineProp(demandA,"a","b");

    //var demandB = new Demand();
    //demandB.defineProp(demandB,"c","d");

};

consumeApplication = function (application) {

};

consume = function (values, callback) {
    if (values.constructor === Array) {
        values.forEach(function (entry) {
            parse(entry);
        });
    } else {
        console.log('single obj');
        parse(values);
    }

    function parse(shorthand) {
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
                        var urlParts = url.parse(value);
                        async.parallel([
                            function (callback) {
                                var l3obj = new L3ep();
                                classifier.validateIp(value, function (err, res) {
                                    if (err) {
                                        l3obj.addFqdName(urlParts.hostname)
                                    } else {
                                        l3obj.addIpAddr(urlParts.hostname)
                                    }
                                    return;

                                });
                                callback(null, l3obj);
                            },
                            function (callback) {
                                if (urlParts.protocol = 'https:' && urlParts.port == null) {
                                    urlParts.port = 443;
                                }
                                if (urlParts.protocol = 'http:' && urlParts.port == null) {
                                    urlParts.port = 80;
                                }
                                var l4obj = new L4ep();
                                l4obj.addPort('TCP', urlParts.port);
                                callback(null, l4obj);
                            }
                        ], function (err, result) {
                            if (err) {
                                logger.error(err);
                                if (callback) callback(err, null);
                            } else {
                                var l3Obj = result[0];
                                var l4Obj = result[1];

                                var consObj = new Consumer();
                                consObj.addProducer(l3Obj);
                                consObj.addProduct(l4Obj);

                                var dmndObj = new Demand(consObj);
                                dmndObj.validateAndSend();


                                if (callback) callback(null, result); // TODO: Demand instead of result
                            }

                        });


                        break;


                    case "APP":
                        break;


                    case "IP":
                        break;

                    case "FOR":
                    case "FROM":
                        if (callback) callback(new Error('The "FROM" object can only be used together with another key.'), null);
                        break;

                    default:
                        if (callback) callback(new Error('Invalid key supplied: ' + key), null);
                }
            }
        }

        // We have exactly two key value pairs
        if (Object.keys(shorthand).length == 2) {

        }


        //for (var key in shorthand) {
        //    var value = shorthand[key];
        //
        //    switch (key.toUpperCase()) {
        //        case "TCP":
        //        case "UDP":
        //            classifier.validatePort(value);
        //            break;
        //        default:
        //
        //    }
        //
        //    logger.debug('key: ' + key + ' / val: ' + value);
        //}
    }

}
;

module.exports = {
    Acdp: new Acdp,
    consumeSpecific: consumeSpecific,
    consumePattern: consumePattern,
    consumeApplication: consumeApplication,
    produce: produce,
    consume: consume
};