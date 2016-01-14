// Constructor
function Producer(portType, portNumber) {
    this.producer = {};
    this.producer.application = {};
    this.producer.produces = [];
    this.producer.forConsumers = [];
}

Producer.prototype.addPort = function (endpoint) {
    this.producer.produces.push(endpoint);
};

Producer.prototype.addProducer = function (endpoint) {
    this.producer.forConsumers.push(endpoint);
};

module.exports = Producer;