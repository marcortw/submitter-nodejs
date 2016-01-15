var backoff = require('backoff');
var config = require('./../configloader.js');
var logger = require('./../logger.js');
var validator = require('./../acdpDraft01');
var uuid = require('node-uuid');
var util = require('util');
var sender = require('./../senderHandling');

// Private shared vars
var maxDelay = (config.get('protocols:global:timing:exponentialBackoff') ? config.get('protocols:global:timing:maxDelayMs') : config.get('protocols:global:timing:minDelayMs') + 1);


Request.showCount = function () {
    console.log(objCount)
};

/**
 *
 * @param JS single demand (producer or consumer) object
 * @constructor
 */
function Request(specificDemand) {
    this.constructor.objCount++;

    // ************************************************************************
    // PRIVATE VARIABLES AND FUNCTIONS
    // ONLY PRIVELEGED METHODS MAY VIEW/EDIT/INVOKE
    // ***********************************************************************
    var privVarTst = "privateValue";

    function sendToHandler(options, callback) {
        logger.debug('DEMAND: ' + options.id + ' - execute some code.');
        sender.treatDemand(options.request, function (err, result) {
            if (err) {
                logger.error('DEMAND: ' + err);
                callback(new Error('Real sending error'), null);
            } else {
                logger.debug('Sending successful. Will propagate an error to continue backoff');
                callback(new Error('Fake sending error'), result); //TODO: Remove this ugly hack
            }
        })

    }


    // ************************************************************************
    // PRIVILEGED METHODS
    // MAY BE INVOKED PUBLICLY AND MAY ACCESS PRIVATE ITEMS
    // MAY NOT BE CHANGED; MAY BE REPLACED WITH PUBLIC FLAVORS
    // ************************************************************************

    this.call = backoff.call(sendToHandler, this, function (err, res) {
        // Notice how the call is captured inside the closure.
        //console.log('Num retries: ' + call.getNumRetries());

        if (err) {
            console.log('Error: ' + err.message);
        } else {
            console.log('Status: ' + res.statusCode);
        }
    });

    // Called when function is called with function's args. Inspect with util.inspect(arguments).
    this.call.on('call', function (url) {
    });

    // Called with results each time function returns. Inspect with util.inspect(arguments).
    this.call.on('callback', function (err, res) {
        if (err) {
            logger.error('DEMAND: Sending function returned an error. Result: ' + err.message);
        } else {
            logger.debug('DEMAND: Sending function executed successfully');
        }
    });

    // Called on backoff. Inspect with util.inspect(arguments).
    this.call.on('backoff', function (number, delay) {
        logger.debug('DEMAND: sleeping for ' + delay + 'ms');
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
    this.request.submitter = {};

    if (specificDemand && typeof specificDemand === 'object') {
        this.request = specificDemand;
    }


    logger.debug('DEMAND: ' + this.id + ' - created');

}

// ************************************************************************
// PUBLIC METHODS -- ANYONE MAY READ/WRITE
// ************************************************************************
Request.prototype.validateAndSend = function (callback) {
    this.acdpDataRefresh(this);
    validator.validateDemandMessage(this.request, (function (err, result) {
        if (err) {
            logger.error('DEMAND: Validation error encountered. Will not start sending process for ' + this.id);
            logger.debug(err); //TODO: This is printed on a new line, don't know if problem from z-schema or other problem
            if (callback) callback(err, null);

        } else {
            this.call.start();
            if (callback) callback(null, result);
        }
    }).bind(this));
};

Request.prototype.acdpDataRefresh = function (callback) {
    logger.debug('ACDP Data refresh in Request');

    this.recursiveAcdpDataRefresh(this.request, function (err, result) {
        if (err) {
            logger.error(err)
            if (callback) callback(err, false);
        } else {
            if (callback) callback(null, result);
        }
    })
};

Request.prototype.recursiveAcdpDataRefresh = function (obj, callback) { //TODO: Should not be public (in case of self-referencing objects, endless loop, boom!
    if (typeof obj.acdpDataRefresh == 'function') {
        obj.acdpDataRefresh(); //TODO Check callback forwarding
    }

    for (var k in obj) if (typeof obj[k] == "object" && obj[k] !== null)
        this.recursiveAcdpDataRefresh(obj[k]);
};

/**
 *
 * @param specificDemand, usually a Consumer or Producer
 */
Request.prototype.addDemand = function (specificDemand) {
    this.request.demands = ( typeof this.request.demands != 'undefined' && this.request.demands instanceof Array ) ? this.request.demands : [];
    this.request.demands.push(specificDemand);
};

// ************************************************************************
// PROTOTYPE PROPERTIES -- ANYONE MAY READ/WRITE (but may be overridden)
// ************************************************************************
Request.prototype.pubVarTst = "publicValue";

// ************************************************************************
// STATIC PROPERTIES -- ANYONE MAY READ/WRITE
// ************************************************************************
Request.objCount = 0;

module.exports = Request;