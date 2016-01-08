var Port = require('./Layer4Endpoint');

var a = new Port("TCP", 443);
var b = new Port("TCP", 443);

console.log(a.port);