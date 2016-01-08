var backoff = require('backoff');
var config = require('./configloader.js');

var exponentialBackoff = backoff.exponential({
    randomisationFactor: config.get('protocols:global:timing:randomizationFactor'),
    initialDelay: config.get('protocols:global:timing:minDelayMs'),
    maxDelay: config.get('protocols:global:timing:maxDelayMs')
});

//exponentialBackoff.failAfter(10);

exponentialBackoff.on('backoff', function(number, delay) {
    // Do something when backoff starts, e.g. show to the 
    // user the delay before next reconnection attempt. 
    console.log(number + ' ' + delay + 'ms');
});

exponentialBackoff.on('ready', function(number, delay) {
    // Do something when backoff ends, e.g. retry a failed 
    // operation (DNS lookup, API call, etc.). If it fails 
    // again then backoff, otherwise reset the backoff 
    // instance.
    console.log('restarting');
    exponentialBackoff.backoff();
});

exponentialBackoff.on('fail', function() {
    // Do something when the maximum number of backoffs is 
    // reached, e.g. ask the user to check its connection. 
    console.log('fail');
});



// class methods
Producer.prototype.backoff = function () {
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