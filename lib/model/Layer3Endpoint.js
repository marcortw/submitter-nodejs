// Constructor
function Layer3Endpoint() {
    this.layer3Endpoint = {}
}

Layer3Endpoint.prototype.addIpAddr = function (ipAddr) {
    this.layer3Endpoint.ipAddresses = ( typeof this.layer3Endpoint.ipAddresses != 'undefined' && this.layer3Endpoint.ipAddresses instanceof Array ) ? this.layer3Endpoint.ipAddresses : [];
    this.layer3Endpoint.ipAddresses.push(ipAddr);
};

Layer3Endpoint.prototype.addFqdName = function (ipAddr) {
    this.layer3Endpoint.fqdNames = ( typeof this.layer3Endpoint.fqdNames != 'undefined' && this.layer3Endpoint.fqdNames instanceof Array ) ? this.layer3Endpoint.fqdNames : [];
    this.layer3Endpoint.fqdNames.push(ipAddr);
};

Layer3Endpoint.prototype.addSpecial = function (specialType) {
    this.layer3Endpoint.special = specialType;
};

module.exports = Layer3Endpoint;