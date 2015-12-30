/**
 * Created by mschnueriger on 30.12.2015.
 */
var multicastSender = require('./senders/multicast.js');
var unicastSender = require('./senders/unicast.js');

var news = [
    "Borussia Dortmund wins German championship",
    "Tornado warning for the Bay Area",
    "More rain for the weekend",
    "Android tablets take over the world",
    "iPad2 sold out",
    "Nation's rappers down to last two samples"
];


setInterval(function() { multicastSender.send(randomMessage()) }, 3000);

function randomMessage() {
    return message = new Buffer(news[Math.floor(Math.random() * news.length)]);
}