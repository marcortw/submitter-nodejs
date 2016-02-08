// Constructor
function ApplicationEndpoint() {
    this.applicationEndpoint = {}
}

ApplicationEndpoint.prototype.addApplication = function (appId) {
    this.applicationEndpoint.applications = ( typeof this.applicationEndpoint.applications != 'undefined' && this.applicationEndpoint.applications instanceof Array ) ? this.applicationEndpoint.applications : [];
    var appObject = {"application": {"applicationid": appId}};
    this.applicationEndpoint.applications.push(appObject);
};

module.exports = ApplicationEndpoint;