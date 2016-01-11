var dgram = require('dgram');
var Random = require('random-js');
var async = require('async');
var logger = require('../logger.js');
var config = require('../configloader.js');

var rndEngine = Random.engines.mt19937().autoSeed();
var distribution = Random.integer(1025, 65535);

module.exports = {
    sendMulticast: function (message, callback) {

        async.waterfall([
            function (callback) {
                if (config.get('protocols:multicast:multicastSenderMode:enabled')) {
                    callback(null);
                } else {
                    callback(new Error('Multicast sending is disabled. Will not send'));
                }
            },
            function (callback) {
                var server = dgram.createSocket("udp4");
                callback(null, server);
            },
            function (server, callback) {
                server.bind(chooseRandomPort(), function () {
                    server.setBroadcast(true);
                    server.setMulticastTTL(128);
                });
                callback(null, server);
            },
            function (server, callback) {
                try {
                    server.send(message, 0, message.length, config.get('protocols:multicast:multicastSenderMode:config:dstPort'), "239.255.255.242");
                    logger.debug("Sent " + message + " to the wire...");
                    setTimeout(function () {
                        server.close();
                    }, 1000);
                    callback(null, 'Multicast sending done');
                } catch (err) {
                    callback(err);
                }
            }
        ], function (err, result) {
            if (err) {
                logger.error('MULTICAST: ' + err);
                callback(err);
            } else {
                callback(null, result);
            }
        });

    }
};


function chooseRandomPort() {
    return distribution(rndEngine);
}