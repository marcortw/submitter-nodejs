// Constructor
function Response() {
    this.response = {};
    this.response.type = "ACDPRESPONSE";
    this.response.receiver = {"description": "ACDP Pseudo-Receiver"};
}

Response.prototype.addResponse = function (id, state) {
    this.response.demands = ( typeof this.response.demands != 'undefined' && this.response.demands instanceof Array ) ? this.response.demands : [];
    this.response.demands.push({id: id, state: state});
};

module.exports = Response;