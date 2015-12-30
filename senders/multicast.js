var dgram = require('dgram');
var Random = require('random-js');
var async = require('async');

var rndEngine = Random.engines.mt19937().autoSeed();
var distribution = Random.integer(1025, 65535);

module.exports = {
    send: function (message) {

        async.waterfall([
            function (callback) {
                var server = dgram.createSocket("udp4");
                callback(null, server);
            },
            function (server, callback) {
                server.bind(generateNaturalLessThan100(), function () {
                    server.setBroadcast(true);
                    server.setMulticastTTL(128);
                });
                callback(null, server);
            },
            function (server, callback) {
                server.send(message, 0, message.length, 42000, "230.185.192.108");
                console.log("Sent " + message + " to the wire...");
                setTimeout(function () {
                    server.close();
                }, 1000);
                callback(null, 'done');
            }
        ], function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });

    }
};


function generateNaturalLessThan100() {
    return distribution(rndEngine);
}