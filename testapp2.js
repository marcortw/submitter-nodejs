var acdp = require('./index.js');
//var test = require('./testapp3.js');


acdp.consume({"tcp": "8000"});
//acdp.consume({"url": "http://www.protect7.com/"}); // OK
//acdp.consume({"url": "https://www.google.com:8080/aaa"}); //OK
//acdp.consume({"fantasy":"valueWithout a meaning"}); //OK, fails
//acdp.consume({"ip": "74.125.136.105", "tcp":80}); // OK
//acdp.consume([{"url": "http://www.google.com:80/aaa"},{"url": "https://www.google.com:443/aaa"}]); //OK
//acdp.consume({"app": "1234567890123"}) // OK
//acdp.consume({"app": "1234567890123","tcp":80}) //OK
//acdp.consume({"app": "1234567890123","special":"KNOWN"}) //OK
//acdp.consume([{"app": "1234567890123"},{"app": "42424242"}]); //OK
//acdp.consume([{"app": "1234567890123"},{"app": "42424242"}]); //OK
//acdp.consume({"url": "https://www.google.com:8080/443"}) //OK
//acdp.consume({"ip": "74.125.136.105"}) // OK
//acdp.consume({"ip": "74.125.136.0/24"}) //OK
//acdp.consume({"ip": "74.125.136.0-255"}) //OK, BUT SHOULD FAIL !!!! TODO: fix
//acdp.consume({"ip": "74.125.136.0-74.125.136.255"}) //OK, BUT Should maybe also fail TODO: fix
//acdp.consume([{"ip": "74.125.136.0-74.125.136.255"}, {"url": "https://www.google.com:443/aaa"}]) // OK; but should fail partially because ip not yet implemented. //TODO Decide if we should fail if any demand is not valid.
//
//
//acdp.produce({"tcp":443});
//acdp.produce({"httppath":"/app2/"});
//acdp.produce({"tcp":443,"for":{"app":"1234567890123"}}); //OK
//acdp.produce([{"tcp":443,"for":{"app":"1234567890123"}},{"udp":123,"for":{"app":"1234567890123"}}]);
//acdp.produce({"for":"aaaaa"}); // OK, Fails

