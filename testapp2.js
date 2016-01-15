var acdp = require('./index.js');
//acdp.consumeSpecific([{"blubb": 443}, {"TCP": "abc"}, {"TCP": 80}], [{"host": "www.google.com"}]);
//acdp.produceSpecific([{"TCP": 443}, {"TCP": 80}]);
//acdp.consumePattern({"url": "https://www.google.com:8080/443"});

//acdp.consumePattern({"url": "http://www.google.com"});
//acdp.consumeApplication({"id": "12399243885481-29299323"});

//var interval = setInterval(function() {
//    acdp.consumeSpecific([{"TCP": 443}, {"TCP": 80}], [{"host": "www.google.com"}]);
//}, 10000);

//Always single Array or single object

//acdp.consume({"url": "https://www.google.com/aaa"}, function (err, result) {
//    if (err) {
//        console.log("Request invalid");
//    } else {
//        console.log(JSON.stringify(result));
//    }
//});

//acdp.consume({"url": "http://www.protect7.com/"}); // OK
//acdp.consume({"url": "https://www.google.com:8080/aaa"}); //OK
//acdp.consume({"fantasy":"valueWithout a meaning"}); //OK, fails
//acdp.consume({"ip": "74.125.136.105", "tcp":80});
//acdp.consume([{"url": "http://www.google.com:80/aaa"},{"url": "https://www.google.com:443/aaa"}]); //OK
//acdp.consume({"app": "1234567890123"}) // OK
//acdp.consume({"app": "1234567890123","tcp":80})
//acdp.consume({"app": "1234567890123","special":"KNOWN"})
//acdp.consume([{"app": "1234567890123"},{"app": "42424242"}]); //OK
//acdp.consume([{"app": "1234567890123"},{"app": "42424242"}]); //OK
//acdp.consume({"url": "https://www.google.com:8080/443"}) //OK
//acdp.consume({"ip": "74.125.136.105"})
//acdp.consume({"ip": "74.125.136.0/24"})
//acdp.consume({"ip": "74.125.136.0-255"})
//acdp.consume({"ip": "74.125.136.0-74.125.136.255"})
acdp.consume([{"ip": "74.125.136.0-74.125.136.255"}, {"url": "https://www.google.com:443/aaa"}]) // OK; but should fail partially because ip not yet implemented. //TODO Decide if we should fail if any demand is not valid.
//
//
//acdp.produce({"port":443});
////acdp.produce({"httppath":"/app2/"});
//acdp.produce({"port":443,"for":{"app":"1234567890123"}});
//acdp.produce([{"port":443,"for":{"app":"1234567890123"}},{"port":80,"for":{"app":"1234567890123"}}]);
