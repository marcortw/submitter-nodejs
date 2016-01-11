var config = require('../configloader.js');
var dns = require('dns'),
    dnscache = require('dnscache')({
        "enable": true,
        "ttl": 300,
        "cachesize": 1000
    });


module.exports = {
    acdpResolveSrv: function (callback) {
        dns.resolveSrv('_acdp-receiver._tcp.' + config.get('protocols:unicast:dnsDiscoveryMode:manualSearchDomain'), function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(res);
            }
        });
    }
};