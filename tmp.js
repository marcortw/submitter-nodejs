var requestify = require('requestify');

requestify.post('http://localhost:42000', {
        hello: 'world'
    })
    .then(function(response) {
        // Get the response body (JSON parsed or jQuery object for XMLs)
        response.getBody();

        // Get the raw response body
        response.body;
    });
