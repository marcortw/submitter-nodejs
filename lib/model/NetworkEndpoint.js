function NetworkEndpoint() {
    this.networkEndpoint = {}
}

NetworkEndpoint.prototype.addIpAddr = function (ipAddr) {
    this.networkEndpoint.ipAddresses = ( typeof this.networkEndpoint.ipAddresses != 'undefined' && this.networkEndpoint.ipAddresses instanceof Array ) ? this.networkEndpoint.ipAddresses : [];
    this.networkEndpoint.ipAddresses.push(ipAddr);
};

NetworkEndpoint.prototype.addFqdName = function (fqdn) { // no need to encode to punycode because url already does this for us
    this.networkEndpoint.fqdNames = ( typeof this.networkEndpoint.fqdNames != 'undefined' && this.networkEndpoint.fqdNames instanceof Array ) ? this.networkEndpoint.fqdNames : [];
    if (!fqdn.endsWith('.')) fqdn = fqdn + '.';
    this.networkEndpoint.fqdNames.push(fqdn);
};

NetworkEndpoint.prototype.addSpecial = function (specialType) {
    this.networkEndpoint.special = specialType;
};

module.exports = NetworkEndpoint;