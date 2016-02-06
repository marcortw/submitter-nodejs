var url = require('url');
var async = require('async');
var constants = require('./constants');
var L3ep = require('./model/Layer3Endpoint');
var L4ep = require('./model/Layer4Endpoint');

module.exports = {
    validateUrl: function (url, callback) {
        var regex = constants['REGEX_URL'];
        var re = new RegExp(regex);
        if (re.test(url)) {
            callback(null, true);
        } else {
            callback(new Error('Given URL value is not valid.'), false);
        }
    },
    validatePort: function (port, callback) {
        var re = new RegExp(constants['REGEX_PORT']);
        if (re.test(port)) {
            callback(null, true);
        } else {
            callback(new Error('Given Port value is not valid.'), false);
        }
    },
    validateIp: function (ip, callback) {
        var re = new RegExp(constants['REGEX_IPADDR']);
        if (re.test(ip)) {
            callback(null, true);
        }

        re = new RegExp(constants['REGEX_IPRANGE']);
        if (re.test(ip)) {
            callback(null, true);
        }

        re = new RegExp(constants['REGEX_IPCIDR']);
        if (re.test(ip)) {
            callback(null, true);
        }

        callback(new Error('Given IP value is not valid.'));
    },
    objectsFromUrl: function (givenUrl, callback) {
        var urlParts = url.parse(givenUrl);
        async.parallel([
            function (callback) {
                var l3obj = new L3ep();
                module.exports.validateIp(givenUrl, function (err, res) {
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
                if (urlParts.protocol == 'https:' && urlParts.port == null) {
                    urlParts.port = 443;
                }
                if (urlParts.protocol == 'http:' && urlParts.port == null) {
                    urlParts.port = 80;
                }
                if (typeof urlParts.port == 'string') {
                    urlParts.port = +urlParts.port
                }
                var l4obj = new L4ep();
                l4obj.addPort('TCP', urlParts.port);
                callback(null, l4obj);
            }
        ], function (err, result) {
            if (err) {
                callback(err)
            } else {
                callback(null, result);
            }
        });
    }

};