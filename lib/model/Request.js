var backoff = require('backoff');
var config = require('../configloader');
var logger = require('../logger');
var validator = require('../acdpDraft01');
var uuid = require('node-uuid');
var util = require('util');
var async = require('async');
var crypto = require('../crypto');
var sender = require('../senderHandling');

// Private shared vars
var maxDelay = (config.get('protocols:global:timing:exponentialBackoff') ? config.get('protocols:global:timing:maxDelayMs') : config.get('protocols:global:timing:minDelayMs') + 1);


/**
 *
 * @param specificDemand single demand (producer or consumer) object
 * @constructor
 */
function Request(specificDemand) {
    this.constructor.objCount++;

    // ************************************************************************
    // PRIVATE VARIABLES AND FUNCTIONS
    // ONLY PRIVELEGED METHODS MAY VIEW/EDIT/INVOKE
    // ***********************************************************************
    var privVarTst = "privateValue";

    function sendToHandler(request, callback) {
        logger.debug('Trying to resend request ' + request.id);
        if (request.wrapper) {
            sender.treatDemand(request.wrapper, function (err, result) {
                if (err) {
                    logger.error('DEMAND: ' + err);
                    callback(new Error('Real sending error'), null);
                } else {
                    logger.debug('Sending successful. Will propagate an error to continue backoff');
                    callback(new Error('Fake sending error'), result); //TODO: Remove this ugly hack
                }
            })
        } else {
            sender.treatDemand(request.request, function (err, result) {
                if (err) {
                    logger.error('DEMAND: ' + err);
                    callback(new Error('Real sending error'), null);
                } else {
                    logger.debug('Sending successful. Will propagate an error to continue backoff');
                    callback(new Error('Fake sending error'), result); //TODO: Remove this ugly hack
                }
            })
        }
    }


    // ************************************************************************
    // PRIVILEGED METHODS
    // MAY BE INVOKED PUBLICLY AND MAY ACCESS PRIVATE ITEMS
    // MAY NOT BE CHANGED; MAY BE REPLACED WITH PUBLIC FLAVORS
    // ************************************************************************

    this.call = backoff.call(sendToHandler, this, function (err, res) {
        // Notice how the call is captured inside the closure.

        if (err) {
            logger.error('Error: ' + err.message);
        } else {
            logger.error('Status: ' + res.statusCode);
        }
    });

    // Called when function is called with function's args. Inspect with util.inspect(arguments).
    this.call.on('call', function (url) {
    });

    // Called with results each time function returns. Inspect with util.inspect(arguments).
    this.call.on('callback', function (err, res) {
        if (err) {
            logger.trace('Sending function returned an error. Result: ' + err.message);
        } else {
            logger.debug('Sending function executed successfully');
        }
    });

    // Called on backoff. Inspect with util.inspect(arguments).
    this.call.on('backoff', function (number, delay) {
        logger.debug('Next sending in ' + delay + 'ms');
    });

    // sets the backoff strategy
    this.call.setStrategy(new backoff.ExponentialStrategy(
        {
            randomisationFactor: config.get('protocols:global:timing:randomizationFactor'),
            initialDelay: config.get('protocols:global:timing:minDelayMs'),
            maxDelay: config.get('protocols:global:timing:exponentialBackoff') ? config.get('protocols:global:timing:maxDelayMs') : config.get('protocols:global:timing:minDelayMs') + 1
        }
    ));

    // ************************************************************************
    // PUBLIC PROPERTIES -- ANYONE MAY READ/WRITE
    // ************************************************************************
    this.id = uuid.v4(); // private variable, accessible only within the constructor TODO: Add into schema

    // The basic request structure
    this.request = {};
    this.request.type = "ACDPREQUEST";
    this.request.submitter = {};
    this.request.submitter.description = config.get('submitter:version');

    if (specificDemand && typeof specificDemand === 'object') {
        this.request = specificDemand;
    }


    logger.debug('Trying to instantiate request with id ' + this.id);

}

// ************************************************************************
// PUBLIC METHODS -- ANYONE MAY READ/WRITE
// ************************************************************************
Request.prototype.validateAndSend = function (callback) {
    var currentRequest = this;

    validator.validateDemandMessage(currentRequest.request, (function (err, result) {
        if (err) {
            logger.error('Validation error encountered. Will not start sending process for ' + this.id);
            logger.debug(err); //TODO: This is printed on a new line, don't know if problem from z-schema or other problem
            if (callback) callback(err, null);

        } else {
            crypto.encrypt(JSON.stringify(currentRequest.request), function (err, result) {
                if (err) {
                    currentRequest.call.start();
                    if (callback) callback(null, currentRequest.request);
                } else {
                    currentRequest.wrapper = {
                        "type": "ACDPWRAPPER"
                    };
                    currentRequest.wrapper.jwe = result;
                    currentRequest.call.start();
                    if (callback) callback(null, currentRequest.wrapper);
                }
            });

        }
    }));
};

/**
 *
 * @param specificDemand Usually a Consumer or Producer
 */
Request.prototype.addDemand = function (specificDemand) {
    this.request.demands = ( typeof this.request.demands != 'undefined' && this.request.demands instanceof Array ) ? this.request.demands : [];
    this.request.demands.push(specificDemand);
};

module.exports = Request;