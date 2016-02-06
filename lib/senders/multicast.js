var dgram = require('dgram');
var Random = require('random-js');
var async = require('async');
var logger = require('../logger.js');
var Response = require('../model/Response');
var config = require('../configloader.js');

var rndEngine = Random.engines.mt19937().autoSeed();
var distribution = Random.integer(1025, 65535);

module.exports = {
    sendMulticast: function (options, msgObject, callback) {

        async.waterfall([
            //function (callback) {
            //    if (config.get('protocols:multicast:multicastSenderMode:enabled')) {
            //        callback(null);
            //    } else {
            //        callback(new Error('Multicast sending is disabled. Will not send'));
            //    }
            //},
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
                    var message = new Buffer(JSON.stringify(msgObject));
                    server.send(message, 0, message.length, options.dstPort, options.dstAddr);
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
                callback(err);
            } else {
                var fakeResponse = new Response();
                async.forEachOf(msgObject.demands, function (value, key, callback) {
                    var producer = value.producer;
                    var id = producer.id;
                    fakeResponse.addResponse(id,"RECEIVED");
                    callback();
                }, function (err) {
                    if (err) console.error(err.message);
                    // configs is now a map of JSON data
                    //doSomethingWith(configs);
                    callback(null, result);
                });


            }
        });

    }
};


function chooseRandomPort() {
    return distribution(rndEngine);
}