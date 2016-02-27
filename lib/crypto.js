var jose = require('node-jose');
var logger = require('./logger');
var config = require('./configloader');
var async = require('async');

var initialized = false;
var keystore;
var keyid;

var init = function (callback) {
    if (!initialized) {
        keystore = jose.JWK.createKeyStore();

        if (config.get('encryption:jwekey')) {
            keystore.add(config.get('encryption:jwekey'), "json")
                .then(function (jwk) {
                    // {result} is a jose.JWK.Key
                    logger.debug('Crypto module has been initialized with a valid key');
                    keyid = jwk.kid;
                    initialized = true;
                    callback(null, keystore.get(keyid));
                })
                .catch(function (err) {
                    logger.debug('Crypto module has been initialized but did not receive a valid key');
                    initialized = true;
                    callback(err);
                });
        } else {
            var msg = 'Crypto module has been initialized but did not receive any key';
            logger.debug(msg);
            initialized = true;
            callback(new Error(msg));
        }

    } else {
        if (keyid) {
            callback(null, keystore.get(keyid));
        } else {
            callback(new Error('No valid key available for crypto operations'));
        }
    }
};

/**
 *
 * @param input a String to be encrypted
 * @param callback Result will be a jwe object
 */
var encrypt = function (input, callback) {
    async.waterfall([
        function (callback) {
            init(function (err, result) {
                callback(err, result);
            });
        },
        function (jwk, callback) {
            // {input} must be a Buffer
            jose.JWE.createEncrypt(jwk)
                .update(new Buffer(input, 'utf8'))
                .final()
                .catch(function (err) {
                    callback(err);
                })
                .then(function (jwe) {
                    callback(null, jwe);
                });
        }
    ], function (err, result) {
        if (err) {
            callback(err)
        } else {
            callback(null, result);
        }
    });

};

/**
 *
 * @param input a jwe object or json
 * @param callback returns an error or a result which is a string
 */
var decrypt = function (input, callback) {
    async.waterfall([
        function (callback) {
            init(function (err, result) {
                callback(err, result);
            });
        },
        function (jwk, callback) {
            // {input} is a Buffer
            jose.JWE.createDecrypt(keystore)
                .decrypt(input)
                .catch(function (err) {
                    callback(err);
                })
                .then(function (result) {
                    callback(null, result.plaintext.toString('utf8'));
                });
        }
    ], function (err, result) {
        if (err) {
            callback(err)
        } else {
            callback(null, result);
        }
    });
};

module.exports = {
    init: init,
    encrypt: encrypt,
    decrypt: decrypt
};