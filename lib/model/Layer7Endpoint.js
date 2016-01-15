// Constructor
function Layer7Endpoint() {
    this.layer7Endpoint = {}
}

Layer7Endpoint.prototype.addApplication = function (appId) {
    this.layer7Endpoint.applications = ( typeof this.layer7Endpoint.applications != 'undefined' && this.layer7Endpoint.applications instanceof Array ) ? this.layer7Endpoint.applications : [];
    var appObject = {"application": {"applicationid": appId}};
    this.layer7Endpoint.applications.push(appObject);
};

module.exports = Layer7Endpoint;