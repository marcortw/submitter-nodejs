var acdp = require('./index.js');
acdp.consumeSpecific([{"blubb": 443}, {"TCP": "abc"}, {"TCP": 80}], [{"host": "www.google.com"}]);
//acdp.produceSpecific([{"TCP": 443}, {"TCP": 80}]);
acdp.consumePattern({"url": "https://www.google.com"});
acdp.consumePattern({"url": "http://www.google.com"});
acdp.consumeApplication({"id": "12399243885481-29299323"});

//var interval = setInterval(function() {
//    acdp.consumeSpecific([{"TCP": 443}, {"TCP": 80}], [{"host": "www.google.com"}]);
//}, 10000);