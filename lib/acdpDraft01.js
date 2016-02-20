var fs = require('fs');
var tv4 = require('tv4');
var path = require('path');
var logger = require('./logger');

var demandSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schema/combined.schema.v9.json'), 'utf8'));

module.exports = {
    validateDemandMessage: function (request, callback) {
        if (typeof callback === 'function') {
            var demandObject;

            if (request !== null && typeof request === 'object') {
                demandObject = JSON.parse(JSON.stringify(request)); // Ugly, but removes 'undefined' values of nested objects...
            } else {
                try {
                    demandObject = JSON.parse(request);
                } catch (e) {
                    callback(e);
                }
            }

            logger.trace('trying to validate: ' + JSON.stringify(demandObject));
            var valid = tv4.validate(demandObject, demandSchema);

            if (!valid) {
                callback(tv4.error, false);
            } else {
                callback(null, demandObject);
            }
        } else {
            throw new Error('Callback function is mandatory');
        }
    }
};
