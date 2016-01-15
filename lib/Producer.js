var backoff = require('backoff');
var config = require('./configloader.js');
var logger = require('./logger.js');

// Private
var exponentialBackoff;
var maxDelay = (config.get('protocols:global:timing:exponentialBackoff') ? config.get('protocols:global:timing:maxDelayMs') : config.get('protocols:global:timing:minDelayMs')+1);

exponentialBackoff = backoff.exponential({
    randomisationFactor: config.get('protocols:global:timing:randomizationFactor'),
    initialDelay: config.get('protocols:global:timing:minDelayMs'),
    maxDelay: maxDelay
});

// Public
// export the class
module.exports = Producer;

// Constructor
function Producer(demand) {
    // always initialize all instance properties
    this.request = demand;
    this.baz = 'baz'; // default value

    exponentialBackoff.backoff();
}


exponentialBackoff.on('ready', function(number, delay) {
    // Do something when backoff (break) ends
    logger.info('restarting');
    exponentialBackoff.backoff();
});

exponentialBackoff.on('backoff', function(number, delay) {
    // Do something when backoff (break) starts, e.g. show to the
    logger.debug('Going to send request again in ' + delay + 'ms');
});

// class methods
Producer.prototype.resend = function () {
    var self = this;
    console.log('would send');

    sendCount++;

    // and schedule a repeat
    //setTimeout(self.resend, 3000);

    // call this function again after
    setTimeout((function () {
        this.resend(); //now you get this as your object of type stage
    }).bind(this), 3000);  //bind this here
};