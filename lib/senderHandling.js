var async = require('async');
var config = require('./configloader.js');
var logger = require('./logger.js');
var unicastSender = require('./senders/unicast');
var multicastSender = require('./senders/multicast');
var dnsSrv = require('./discovery/dnssrv.js');

localNameDiscovery = function (demandObj, callback) {
    if (config.get('protocols:unicast:localConfigMode:enabled')) {
        unicastSender.sendUnicast(config.get('protocols:unicast:localConfigMode:config'), demandObj, function (err, results) {
            if (err) {
                callback(err);
            } else {
                callback(null, "unicast sending through local name discovery ok");
            }
        })
    } else {
        callback(new Error("Local configuration mode is disabled."));
    }
};
dnsDiscovery = function (demandObj, callback) {
    if (config.get('protocols:unicast:dnsDiscoveryMode:enabled')) {
        dnsSrv.acdpResolveSrv(function (err, res) {
            if (err) {
                callback(err)
            } else {
                logger.debug(res);
                unicastSender.sendUnicast(config.get('protocols:unicast:localConfigMode:config'), demandObj, function (err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, "unicast sending through dns discovery ok");
                    }
                })
            }
        })
    } else {
        callback(new Error("DNS discovery mode is disabled."));
    }
};
multicastDiscovery = function (demandObj, callback) {
    if (config.get('protocols:multicast:multicastSenderMode:enabled')) {
        async.waterfall([
            function (callback) {
                var jsonObj = JSON.stringify(demandObj);
                callback(null, jsonObj);
            },
            function (msgString, callback) {
                multicastSender.sendMulticast(config.get('protocols:multicast:multicastSenderMode:config'), demandObj, function (err, res) {
                    if (err) {
                        callback(err);
                    }
                    callback(null, "multicast sending ok");
                })
            }
        ], function (err, result) {
            if (err) {
                callback(err)
            }
            callback(null, result);
        });
    } else {
        callback(new Error("Multicast discovery mode is disabled"));
    }
};

module.exports = {
    treatDemand: function (demandObj, callback) {

        async.waterfall([
            // perform the discovery and sending using a supplied endpoint
            function (callback) {
                localNameDiscovery(demandObj, function (err, result) {
                    var state = {'sent': false};
                    if (err) {
                        logger.debug(err.message);
                    } else {
                        state.sent = true;
                    }
                    callback(null, state);
                })
            },
            // perform the discovery and sending using DNS discovery
            function (state, callback) {
                if (state.sent) {
                    callback(null, state);
                } else {
                    dnsDiscovery(demandObj, function (err, result) {
                        if (err) {
                            //TODO: implement the error object identification in the logger and just pass the err
                            logger.debug(err.message);
                        } else {
                            state.sent = true;
                        }
                        callback(null, state);
                    })
                }
            },
            // perform the sending using multicast, regardless of the previous state
            function (state, callback) {
                multicastDiscovery(demandObj, function (err, result) {
                    if (err) {
                        logger.error(err.message);
                    } else {
                        state.sent = true;
                    }
                    callback(null, state);
                })
            }
        ], function (err, state) {
            if (err) {
                callback(err)
            } else {
                if (!state.sent) {
                    callback(new Error('No sending method was successful'))
                } else {
                    callback(null, "sending ok")
                }
            }
        });
    }
};
