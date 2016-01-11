var async = require('async')
var config = require('./configloader.js');
var logger = require('./logger.js');
var unicastSender = require('./senders/unicast');
var multicastSender = require('./senders/multicast');
var dnsSrv = require('./discovery/dnssrv.js');
var msgPreparation = require('./messagePreparator');


localNameDiscovery = function (demandObj, callback) {
    if (config.get('protocols:unicast:localConfigMode:enabled')) {
        unicastSender.sendUnicast("opts", demandObj, function (err, results) {
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
                unicastSender.sendUnicast("opts", demandObj, function (err, results) {
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
                msgPreparation.jsonFromObj(demandObj, function (err, res) {
                    if (err) {
                        callback(err)
                    }
                    callback(null, res);
                })
            },
            function (msgString, callback) {
                multicastSender.sendMulticast(msgString, function (err, res) {
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
        var sent = false;
        localNameDiscovery(demandObj, function (err, result) {
            if (err) {
                logger.error(err.message);
                dnsDiscovery(demandObj, function (err, result) {
                    if (err) {
                        logger.error(err.message);
                    } else {
                        sent = true;
                    }
                })
            } else {
                sent = true;
            }

            multicastDiscovery(demandObj, function (err, result) {
                if (err) {
                    logger.error('SENDERHANDLING: ' + err.message);
                } else {
                    sent = true;
                }

                if (sent) {
                    callback(null, "sending ok")
                } else {
                    callback(new Error('No sending method was successful'))
                }
            })

        });

    }
};
