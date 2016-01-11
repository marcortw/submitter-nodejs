// Constructor
function Layer4Endpoint(portType, portNumber) {
    this.layer4Endpoint = {}
    this.layer4Endpoint.ports = [];
    this.addPort(portType, portNumber);
}

Layer4Endpoint.prototype.addPort = function (portType, portNumber) {
    this.layer4Endpoint.ports.push({"type": portType, "number": portNumber});
};
module.exports = Layer4Endpoint;