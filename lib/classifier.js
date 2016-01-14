var constants = require('./constants');
var l4ep = require('./model/Layer4Endpoint.js');
var l3ep = require('./model/Layer3Endpoint.js');

module.exports = {
    ///**
    // *
    // * @param shorthand must be a single object like {"key":"value"}
    // * @param callback
    // */
    //validateShorthand: function (shorthand) {
    //    console.log(shorthand);
    //    for (var key in shorthand) {
    //        var value = shorthand[key];
    //        var currType = constants[key.toUpperCase()];
    //        if (typeof currType !== 'undefined') {
    //            var regex = constants['REGEX_' + currType];
    //            var re = new RegExp(regex);
    //            if (re.test(value)) {
    //                return currType;
    //            } else {
    //                throw new Error('Given shorthand value is invalid.');
    //            }
    //        } else {
    //            throw new Error('Given shorthand key is invalid.');
    //        }
    //    }
    //},
    validateUrl: function (url, callback) {
        console.log(url);
        var regex = constants['REGEX_URL'];
        var re = new RegExp(regex);
        if (re.test(url)) {
            callback(null,true);
        } else {
            callback(new Error('Given URL value is not valid.'), false);
        }
    },
    validatePort: function (port, callback) {
        console.log(port);
        var re = new RegExp(constants['REGEX_PORT']);
        if (re.test(port)) {
            callback(null,true);
        } else {
            callback(new Error('Given Port value is not valid.'), false);
        }
    },
    validateIp: function (ip, callback) {
        console.log(ip);
        var re = new RegExp(constants['REGEX_IPADDR']);
        if (re.test(ip)) {
            callback(null,true);
        }

        re = new RegExp(constants['REGEX_IPRANGE']);
        if (re.test(ip)) {
            callback(null,true);
        }

        re = new RegExp(constants['REGEX_IPCIDR']);
        if (re.test(ip)) {
            callback(null,true);
        }

        callback(new Error('Given IP value is not valid.'));
    }
};