var logger = require('./lib/logger.js');

var agentVersion = require('./package.json').version;
var agentDescription = 'ACDP Submitter for Node.js version ' + agentVersion;
logger.info('Starting ' + agentDescription);

logger.debug(
    'Loading ACDP-Submitter from %s',
    __dirname
);


var async = require('async');
var uuid = require('node-uuid');
var constants = require('./lib/constants');

var Request = require('./lib/model/Request.js');
var classifier = require('./lib/classifier');
var Consumer = require('./lib/model/Consumer');
var Producer = require('./lib/model/Producer');
var L3ep = require('./lib/model/NetworkEndpoint');
var L4ep = require('./lib/model/TransportEndpoint');
var L7ep = require('./lib/model/ApplicationEndpoint');
var config = require('./lib/configloader');
var crypto = require('./lib/crypto');


// some config variables which need to be set at startup
if (config.get('application:instanceid:random')) {
    config.set('application:instanceid:value', uuid.v4());
}
config.set('submitter:version', agentDescription);

// user supplied config, e.g. jwe key
var initialized = false;

/**
 *
 * @param options
 * @param callback
 * @returns {*}
 */
var init = function (options, callback) {
    var errors = [];

    // do some sync stuff, fill errors[] if errors happen (may partially work)
    if (!initialized) {
        if (options) {
            if (options.key) {
                try {
                    var key = JSON.stringify(options.key);
                    config.set('encryption:jwekey', key);
                    logger.debug('Supplied key has been added to the configuration.');
                } catch (e) {
                    var keyParsingError = new Error('Supplied key is not a valid JSON structure.');
                    logger.error(keyParsingError);
                    errors.push(keyParsingError);
                }
            }
            //TODO other options
        } else {
            var noOptionsSuppliedError = new Error('No initialization options were supplied.');
            logger.error(noOptionsSuppliedError);
            errors.push(noOptionsSuppliedError);
        }
    } else {
        var noOptionsSuppliedError = new Error('User-supplied config has already been initialized!');
        logger.error(noOptionsSuppliedError);
        errors.push(noOptionsSuppliedError);
    }

    initialized = true;
    if (errors.length > 0) {
        logger.trace("CONFIGURATION AFTER USER-INIT: " + JSON.stringify(config.get()));
        if (callback) callback(errors);
        return errors;
    } else {
        logger.trace("CONFIGURATION AFTER USER-INIT: " + JSON.stringify(config.get()));
        var okmsg = "everything went fine";
        if (callback) callback(null, okmsg);
        return okmsg;
    }
};


/**
 * Takes an array of demands and starts sending them
 * @param {Array} rawDemands
 * @param callback
 */
var rawDemands = function (rawDemands, callback) {
    if (rawDemands.constructor === Array) {
        rawDemandStarter(rawDemands, function (err, result) {
            if (err) {
                logger.error(err);
                if (callback) callback(err, null);
            } else {
                if (callback) callback(null, result);
            }
        })
    } else {
        if (callback) callback(new Error('Supplied data is not an array.'), null);
    }
};

var produce = function (acdpShorthands, callback) {
    if (typeof acdpShorthands === 'object' && acdpShorthands !== null) {
        shorthandStarter(acdpShorthands, producerParser, function (err, result) {
            if (err) {
                logger.error(err);
                if (callback) callback(err, null);
            } else {
                if (callback) callback(null, result);
            }
        });
    }
};

var consume = function (acdpShorthands, callback) {
    if (typeof acdpShorthands === 'object' && acdpShorthands !== null) {
        shorthandStarter(acdpShorthands, consumerParser, function (err, result) {
            if (err) {
                logger.error(err);
                if (callback) callback(err, null);
            } else {
                if (callback) callback(null, result);
            }
        });
    }
};

var rawDemandStarter = function (demands, callback) {
    var reqObj = new Request();
    demands.forEach(function (item) {
        reqObj.addDemand(item);
    });

    reqObj.validateAndSend(function (err, result) {
        if (err) {
            if (callback) callback(err, null);
        } else {
            if (callback) callback(null, result);
        }
    })
};


var shorthandStarter = function (acdpShorthands, parser, callback) {
    var reqObj = new Request();

    if (acdpShorthands.constructor === Array) {
        async.each(acdpShorthands, function (acdpShorthand, callback) {
            parser(acdpShorthand, function (err, consumerOrProducer) {
                if (err) {
                    callback(err)
                } else {
                    reqObj.addDemand(consumerOrProducer);
                    callback();
                }
            });
        }, function (err) {
            if (err) {
                if (callback) callback(err)
            } else {
                reqObj.validateAndSend(function (err, result) {
                    if (err) {
                        if (callback) callback(err, null);
                    } else {
                        if (callback) callback(null, result);
                    }
                })
            }
        });
    } else {
        parser(acdpShorthands, function (err, consumerOrProducer) {
            if (err) {
                if (callback) callback(err)
            } else {
                reqObj.addDemand(consumerOrProducer);
                reqObj.validateAndSend(function (err, result) {
                    if (err) {
                        if (callback) callback(err, null);
                    } else {
                        if (callback) callback(null, result);
                    }
                })
            }
        });
    }
};

var producerParser = function (shorthand, callback) {
    if (Object.keys(shorthand).length > 2) {
        throw new Error('Invalid number of key-value pairs');
    }

    // if we have only one key value pair...
    if (Object.keys(shorthand).length == 1) {
        resolveShorthand(shorthand, function (err, result) {
            if (err) {
                callback(err);
            } else {
                var consObj = {};
                switch (result.type) {
                    case "PORT":
                        consObj = new Producer();
                        var l3ep = new L3ep();
                        l3ep.addSpecial(constants.SPECIAL_UNKNOWN);
                        consObj.addConsumer(l3ep);
                        consObj.addProduct(result.l4ep);
                        callback(null, consObj);
                        break;
                    case "APP":
                        result.l4ep.addSpecial(constants.SPECIAL_UNKNOWN); // do this because the caller only specified an App, no port
                        consObj = new Consumer();
                        consObj.addProduct(result.l4ep);
                        consObj.addProducer(result.l7ep);
                        callback(null, consObj);
                        break;
                    case "IP":
                        result.l4ep.addSpecial(constants.SPECIAL_UNKNOWN); // do this because the caller only specified an IP-Address
                        consObj = new Consumer();
                        consObj.addProducer(result.l3ep);
                        consObj.addProduct(result.l4ep);
                        callback(null, consObj);
                        break;
                    default:
                        var errMsg = 'Invalid shorthand notation: ' + JSON.stringify(shorthand);
                        if (callback) callback(new Error(errMsg), null);
                }
            }
        });
    }

    // We have exactly two key value pairs
    if (Object.keys(shorthand).length == 2) {
        var objects = {};
        async.forEachOf(shorthand, function (value, key, callback) {
            var tmpObj = {};
            tmpObj[key] = value;
            resolveShorthand(tmpObj, function (err, result) {
                if (err) {
                    return callback(err);
                } else {
                    objects[result.type] = result;
                    callback();
                }
            })
        }, function (err) {
            if (err) {
                callback(err)
            } else {
                var validObject = false;
                if (objects.FOR && objects.PORT) {
                    var prodObj = new Producer();
                    prodObj.addProduct(objects.PORT.l4ep);
                    if (objects.FOR.nested.l3ep) prodObj.addConsumer(objects.FOR.nested.l3ep);
                    if (objects.FOR.nested.l7ep) prodObj.addConsumer(objects.FOR.nested.l7ep);
                    validObject = true;
                    callback(null, prodObj);
                }

                if (!validObject) callback(new Error("No allowed shorthand notation"));
            }

        });
    }
};

var consumerParser = function (shorthand, callback) {
    if (Object.keys(shorthand).length > 2) {
        throw new Error('Invalid number of key-value pairs');
    }

    // We have only one key value pair
    if (Object.keys(shorthand).length == 1) {
        resolveShorthand(shorthand, function (err, result) {
            if (err) {
                callback(err);
            } else {
                var consObj = {};
                switch (result.type) {
                    case "URL":
                        consObj = new Consumer();
                        consObj.addProducer(result.l3ep);
                        consObj.addProduct(result.l4ep);
                        callback(null, consObj);
                        break;
                    case "APP":
                        consObj = new Consumer();
                        var l4ep = new L4ep();
                        l4ep.addSpecial(constants.SPECIAL_UNKNOWN); // do this because the caller only specified an App, no port
                        consObj.addProduct(l4ep);
                        consObj.addProducer(result.l7ep);
                        callback(null, consObj);
                        break;
                    case "IP":
                        consObj = new Consumer();
                        var l4ep = new L4ep();
                        l4ep.addSpecial(constants.SPECIAL_UNKNOWN); // do this because the caller only specified an IP-Address

                        consObj.addProducer(result.l3ep);
                        consObj.addProduct(l4ep);
                        callback(null, consObj);
                        break;
                    default:
                        var errMsg = 'Invalid shorthand notation: ' + JSON.stringify(shorthand);
                        if (callback) callback(new Error(errMsg), null);
                }
            }
        });
    }

    // We have exactly two key value pairs
    if (Object.keys(shorthand).length == 2) {
        var objects = {};
        async.forEachOf(shorthand, function (value, key, callback) {
            var tmpObj = {};
            tmpObj[key] = value;
            resolveShorthand(tmpObj, function (err, result) {
                if (err) {
                    return callback(err);
                } else {
                    objects[result.type] = result;
                    callback();
                }
            })
        }, function (err) {
            if (err) {
                callback(err)
            } else {
                var valid = false;

                if (objects.IP && objects.PORT) {
                    valid = true;
                    var consObj = new Consumer();
                    consObj.addProduct(objects.PORT.l4ep);
                    consObj.addProducer(objects.IP.l3ep);
                    callback(null, consObj);
                }

                if (objects.APP && objects.PORT) {
                    valid = true;
                    var consObj = new Consumer();
                    consObj.addProduct(objects.PORT.l4ep);
                    consObj.addProducer(objects.APP.l7ep);
                    callback(null, consObj);
                }

                if (objects.APP && objects.SPECIAL) {
                    valid = true;
                    var consObj = new Consumer();
                    var l4ep = new L4ep();
                    l4ep.addSpecial(objects.SPECIAL.special);
                    consObj.addProduct(l4ep);
                    consObj.addProducer(objects.APP.l7ep);
                    callback(null, consObj);
                }
                // TODO: implement {"tcp":443, "from": {"app": "App-with-some-name"}}
                // TODO: implement {"tcp":443, "from": {"ip": "an IP address"}}

                if (!valid) callback(new Error("No allowed shorthand notation"));
            }

        });
    }
};

var resolveShorthand = function (result, callback) {
    for (var key in result) {
        var value = result[key];
        switch (key.toUpperCase()) {
            case "URL":
                classifier.objectsFromUrl(value, function (err, results) {
                    if (err) {
                        callback(err, null);
                    } else {
                        var l3Obj = results[0];
                        var l4Obj = results[1];
                        var retObj = {
                            type: "URL",
                            l3ep: l3Obj,
                            l4ep: l4Obj
                        };
                        callback(null, retObj);
                    }
                });
                break;


            case "APP":
                var l7Obj = new L7ep();
                l7Obj.addApplication(value);

                var retObj = {
                    type: "APP",
                    l7ep: l7Obj
                };

                callback(null, retObj);
                break;

            case "TCP":
                var parsedValue = parseInt(value, 10);
                if (isNaN(parsedValue)) {
                    callback(new Error("Value is not a number."));
                } else {
                    var l4Obj = new L4ep();
                    l4Obj.addPort(constants.TCP, parseInt(value, 10));
                    var retObj = {
                        type: "PORT",
                        l4ep: l4Obj
                    };
                    callback(null, retObj);
                }
                break;

            case "UDP":
                var parsedValue = parseInt(value, 10);
                if (isNaN(parsedValue)) {
                    callback(new Error("Value is not a number."));
                } else {
                    var l4Obj = new L4ep();
                    l4Obj.addPort(constants.UDP, parsedValue);
                    var retObj = {
                        type: "PORT",
                        l4ep: l4Obj
                    };
                    callback(null, retObj);
                }
                break;


            case "IP":
                var l3Obj = new L3ep();
                l3Obj.addIpAddr(value);

                var retObj = {
                    type: "IP",
                    l3ep: l3Obj
                };

                callback(null, retObj);
                break;

            case "SPECIAL":
                var specialObj = {"type": value};

                var retObj = {
                    type: "SPECIAL",
                    special: specialObj
                };

                callback(null, retObj);
                break;

            case "FOR":
            case "FROM":
                if (typeof value === 'object' && value !== null) {
                    async.waterfall([
                        function (callback) {
                            if (typeof value === 'object' && value !== null) {
                                resolveShorthand(value, function (err, result) {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        callback(null, result);
                                    }
                                });
                            }
                        },
                        function (nested, callback) {
                            var retObj = {};
                            retObj.type = key.toUpperCase();
                            retObj.nested = nested;
                            callback(null, retObj);
                        }
                    ], function (err, result) {
                        if (err) {
                            callback(err)
                        }
                        callback(null, result);
                    });
                } else {
                    callback(new Error("FOR and FROM keywords can only be used together with an object as a value."));
                }

                break;

            default:
                var errMsg = 'Invalid key supplied: ' + key;
                if (callback) callback(new Error(errMsg), null);
        }
    }
};

module.exports = {
    init: init,
    produce: produce,
    consume: consume,
    rawDemands: rawDemands
};