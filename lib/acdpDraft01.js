var fs = require('fs');
var tv4 = require('tv4');
//var ZSchema = require("z-schema");
//var validator = new ZSchema();
var path = require('path');

var demandSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schema/combined.schema.v6.json'), 'utf8'));

module.exports = {
    validateDemandMessage: function (request, callback) {
        if (typeof callback === 'function') {
            var demandObject;

            if (request !== null && typeof request === 'object') {
                demandObject = JSON.parse(JSON.stringify(request)); // TODO: Ugly, but removes 'undefined' values of nested objects...
            } else {
                try {
                    demandObject = JSON.parse(request);
                } catch (e) {
                    callback(e);
                }
            }

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
