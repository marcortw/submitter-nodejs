var acdp = require('./index.js');
acdp.consumeSpecific([{"TCP": 443}, {"TCP": 80}], [{"host": "www.google.com"}]);
acdp.consumePattern({"url": "https://www.google.com"});
acdp.consumePattern({"url": "http://www.google.com"});
acdp.consumeApplication({"id": "12399243885481-29299323"});