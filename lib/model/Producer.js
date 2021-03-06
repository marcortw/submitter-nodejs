var config = require('../configloader');
var logger = require('../logger');
var uuid = require('node-uuid');

// Constructor
function Producer() {
    this.producer = {};
    this.producer.id = uuid.v4();
    this.producer.application = {};
    this.acdpDataRefresh();
    this.producer.produces = [];
    this.producer.forConsumers = [];
}

Producer.prototype.acdpDataRefresh = function(){
    logger.trace('ACDP Data refresh in Producer');
    this.producer.application.applicationid = config.get('application:applicationid:value');
    this.producer.application.applicationname = config.get('application:name');
    this.producer.application.applicationversion = config.get('application:version');
    this.producer.application.instanceid = config.get('application:instanceid:value');
    this.producer.application.description = config.get('application:application:description');
};


/**
 * typically a l3 endpoint or an application
 * @param endpoint
 */
Producer.prototype.addConsumer = function (endpoint) {
    this.producer.forConsumers = ( typeof this.producer.forConsumers != 'undefined' && this.producer.forConsumers instanceof Array ) ? this.producer.forConsumers : [];
    this.producer.forConsumers.push({"endpoint": endpoint});
};


/**
 * typically a l4 endpoint or an application
 * @param endpoint
 */
Producer.prototype.addProduct = function (endpoint) {
    this.producer.produces = ( typeof this.producer.produces != 'undefined' && this.producer.produces instanceof Array ) ? this.producer.produces : [];
    this.producer.produces.push({"endpoint": endpoint});
};

module.exports = Producer;