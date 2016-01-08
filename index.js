var logger = require('./lib/logger.js');
var acdpinit = require('./lib/init.js');
var Demand = require('./lib/Demand.js');
//var api = require('./lib/api.js');

var Acdp = function () {
    var agentVersion = require('./package.json').version
    logger.info("Starting ACDP Submitter for Node.js version %s.", agentVersion);

    acdpinit.initialize();
};

produce = function (endpoints, forConsumers) {
    console.log('Produce in api!');
};

/**
 *
 * @param endpoints
 * @param fromProducers Array
 * @param description
 */
consumeSpecific = function (endpoints, fromProducers, description) {
    console.log('Consume in api! Endpoints:' + JSON.stringify(endpoints));
    var demand = new Demand();
    demand.consumer = {
        'description': description,
        'consumes': [],
        'fromProducers': []
    };
    //var objProducer = Demand.defineProp(demand, 'producer', {
    //    'description': description,
    //    'produces': [],
    //    'forConsumers': []
    //});
    //demand.consumer.consumes = [];
    demand.consumer.consumes.push({'endpoint': {'layer4Endpoint': {'ports': [endpoints]}}});


};

consumePattern = function (pattern) {
    //var demandA = new Demand();
    //Demand.showCount();
    //Demand.defineProp(demandA,"a","b");
    //demandA.defineProp(demandA,"a","b");

    //var demandB = new Demand();
    //demandB.defineProp(demandB,"c","d");

};

consumeApplication = function (application) {

};

module.exports = {
    Acdp: new Acdp,
    consumeSpecific: consumeSpecific,
    consumePattern: consumePattern,
    consumeApplication: consumeApplication,
    produce: produce
};