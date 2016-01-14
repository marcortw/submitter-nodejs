var config = require('../configloader');

// Constructor
function Consumer() {
    this.consumer = {};
    this.consumer.application = {};
    this.consumer.application.applicationid = config.get('application:applicationid:value');
    this.consumer.application.instanceid =  config.get('application:instanceid:value');
    this.consumer.application.description = config.get('application:application:description');
    this.consumer.consumes = [];
    this.consumer.fromProducers = [];
}


/**
 * typically a l3 endpoint or an application
 * @param endpoint
 */
Consumer.prototype.addProducer = function (endpoint) {
    this.consumer.fromProducers = ( typeof this.consumer.fromProducers != 'undefined' && this.consumer.fromProducers instanceof Array ) ? this.consumer.fromProducers : [];
    this.consumer.fromProducers.push({"endpoint": endpoint});
};


/**
 * typically a l4 endpoint or an application
 * @param endpoint
 */
Consumer.prototype.addProduct = function (endpoint) {
    this.consumer.consumes = ( typeof this.consumer.consumes != 'undefined' && this.consumer.consumes instanceof Array ) ? this.consumer.consumes : [];
    this.consumer.consumes.push({"endpoint": endpoint});
};

module.exports = Consumer;