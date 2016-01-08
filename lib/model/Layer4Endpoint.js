

// Constructor
function Layer4Endpoint(portType, portNumber) {
    this.port = portNumber; // private variable, accessible only within the constructor
    this.type = portType;
}

Layer4Endpoint.prototype.produce = function (endpoints, consumers){
    this.backoff();
};

Layer4Endpoint.prototype.consume = function (endpoints, producers){
    this.backoff();
};

module.exports = Layer4Endpoint;