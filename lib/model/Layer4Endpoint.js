// Constructor
function Layer4Endpoint() {
    this.layer4Endpoint = {}
}

Layer4Endpoint.prototype.addPort = function (portType, portNumber) {
    this.layer4Endpoint.ports = ( typeof this.layer4Endpoint.ports != 'undefined' && this.layer4Endpoint.ports instanceof Array ) ? this.layer4Endpoint.ports : [];
    this.layer4Endpoint.ports.push({"type": portType, "number": portNumber});
};

module.exports = Layer4Endpoint;