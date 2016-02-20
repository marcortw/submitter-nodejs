var logger = require('./lib/logger.js');

var agentVersion = require('./package.json').version;
logger.info('Starting ACDP Submitter for Node.js version %s.', agentVersion);

logger.debug(
    'Loading ACDP-Submitter from %s',
    __dirname
);


var async = require('async');
var constants = require('./lib/constants');

var Request = require('./lib/model/Request.js');
var classifier = require('./lib/classifier');
var Consumer = require('./lib/model/Consumer');
var Producer = require('./lib/model/Producer');
var L3ep = require('./lib/model/NetworkEndpoint');
var L4ep = require('./lib/model/TransportEndpoint');
var L7ep = require('./lib/model/ApplicationEndpoint');
var config = require('./lib/configloader');
var uuid = require('node-uuid');


// some config variables which need to be set at startup
if (config.get('application:instanceid:random')) {
    config.set('application:instanceid:value', uuid.v4());
}


logger.trace("CONFIGURATION: " + JSON.stringify(config.get()));

// TODO: Load manual demands at startup (?)

var produce = function (acdpShorthands, callback) {
    if (typeof acdpShorthands === 'object' && acdpShorthands !== null) {
        starter(acdpShorthands, producerParser, function (err, result) {
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
        starter(acdpShorthands, consumerParser, function (err, result) {
            if (err) {
                logger.error(err);
                if (callback) callback(err, null);
            } else {
                if (callback) callback(null, result);
            }
        });
    }
};

var starter = function (acdpShorthands, parser, callback) {
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
                if (objects.IP && objects.PORT) {
                    var consObj = new Consumer();
                    consObj.addProduct(objects.PORT.l4ep);
                    consObj.addProducer(objects.IP.l3ep);
                    callback(null, consObj);
                }

                if (objects.APP && objects.PORT) {
                    var consObj = new Consumer();
                    consObj.addProduct(objects.PORT.l4ep);
                    consObj.addProducer(objects.APP.l7ep);
                    callback(null, consObj);
                }

                if (objects.APP && objects.SPECIAL) {
                    var consObj = new Consumer();
                    var l4ep = new L4ep();
                    l4ep.addSpecial(objects.SPECIAL.special);
                    consObj.addProduct(l4ep);
                    consObj.addProducer(objects.APP.l7ep);
                    callback(null, consObj);
                }

                // TODO: thrown with acdp.consume({"ip": "10.10.81.200", "tcp": 80});
                callback(new Error("No allowed shorthand notation"));
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
    produce: produce,
    consume: consume
};