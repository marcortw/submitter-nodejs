var backoff = require('backoff');
var config = require('./configloader.js');
var logger = require('./logger.js');
var uuid = require('node-uuid');

// Private shared vars
var maxDelay = (config.get('protocols:global:timing:exponentialBackoff') ? config.get('protocols:global:timing:maxDelayMs') : config.get('protocols:global:timing:minDelayMs') + 1);
var objCount = 0;

Demand.defineProp = function (obj, key, value) {
    var config = {
        value: value,
        writable: true,
        enumerable: true,
        configurable: true
    };
    Object.defineProperty(obj, key, config);
};

Demand.showCount = function() {
    console.log(objCount)
};

// Constructor
function Demand() {
    // always initialize all instance properties
    objCount++;
    var id = uuid.v4(); // private variable, accessible only within the constructor

    this.exponentialBackoff = backoff.exponential({ // Privileged methods, are public, but they can access "private" variables declared inside the constructor function.
        randomisationFactor: config.get('protocols:global:timing:randomizationFactor'),
        initialDelay: config.get('protocols:global:timing:minDelayMs'),
        maxDelay: maxDelay
    });

    this.exponentialBackoff.on('ready', function (number, delay) {
        // Do something when backoff (break) ends
        logger.debug('DEMAND: ' + id + ' - restarting');
        this.backoff();
    });

    this.exponentialBackoff.on('backoff', function (number, delay) {
        // Do something when backoff (break) starts, e.g. show to the
        logger.debug('DEMAND: ' + id + ' - sleeping for ' + delay + 'ms');
    });


    logger.info('DEMAND: ' + id + ' - created');
    this.backoff();
}

//Demand.prototype.defineProp = function ( obj, key, value ){
//    var config = {
//        value: value,
//        writable: true,
//        enumerable: true,
//        configurable: true
//    };
//    Object.defineProperty( obj, key, config );
//};

// class methods
Demand.prototype.backoff = function () {
    this.exponentialBackoff.backoff();
};

//Demand.prototype.produce = function (endpoints, consumers){
//    console.log('Produce in Demand!');
//    this.backoff();
//};
//
//Demand.prototype.consume = function (endpoints, producers){
//    console.log('Consume in Demand!');
//    this.backoff();
//};

module.exports = Demand;