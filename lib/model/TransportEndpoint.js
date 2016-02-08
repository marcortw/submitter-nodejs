// Constructor
function TransportEndpoint() {
    this.transportEndpoint = {}
}

TransportEndpoint.prototype.addPort = function (portType, portNumber) {
    this.transportEndpoint.ports = ( typeof this.transportEndpoint.ports != 'undefined' && this.transportEndpoint.ports instanceof Array ) ? this.transportEndpoint.ports : [];
    this.transportEndpoint.ports.push({"type": portType, "number": portNumber});
};

TransportEndpoint.prototype.addSpecial = function (specialType) {
    this.transportEndpoint.special = specialType;
};

module.exports = TransportEndpoint;