var config = require('../configloader');
var logger = require('../logger');
var uuid = require('node-uuid');

// Constructor
function Consumer() {
    this.consumer = {};
    this.consumer.id = uuid.v4();
    this.consumer.application = {};
    this.acdpDataRefresh();
    this.consumer.consumes = [];
    this.consumer.fromProducers = [];
}

Consumer.prototype.acdpDataRefresh = function () {
    logger.trace('ACDP Data refresh in Consumer');
    this.consumer.application.applicationid = config.get('application:applicationid:value');
    this.consumer.application.instanceid = config.get('application:instanceid:value');
    this.consumer.application.description = config.get('application:application:description');
};


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