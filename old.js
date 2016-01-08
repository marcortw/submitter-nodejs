var fs = require('fs');
var multicastSender = require('./senders/multicast.js');
var unicastSender = require('./senders/unicast.js');
var logger = require('./lib/logger.js');
var config = require('./lib/configloader.js');
var validator = require('./lib/acdpDraft01.js');

var agentVersion = require('./package.json').version
logger.info("Using ACDP Submitter for Node.js version %s.", agentVersion);

initialize();




var news = [
    "Borussia Dortmund wins German championship",
    "Tornado warning for the Bay Area",
    "More rain for the weekend",
    "Android tablets take over the world",
    "iPad2 sold out",
    "Nation's rappers down to last two samples",
    fs.readFileSync('C:/Users/mschnueriger/Documents/Oxford/MSc/Thesis/objects/Demand.v4.good.4.json', 'utf8')
];


setInterval(function () {
    multicastSender.send(randomMessage())
}, 3000);

function randomMessage() {
    return message = new Buffer(news[Math.floor(Math.random() * news.length)]);
}