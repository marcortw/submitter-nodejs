var fs = require('fs');
var ZSchema = require("z-schema");
var validator = new ZSchema();
var path = require('path');

var demandSchema = JSON.parse(fs.readFileSync(path.join(__dirname,'./schema/combined.schema.v6.json'), 'utf8'));

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

            var valid = validator.validate(demandObject, demandSchema);

            if (!valid) {
                callback(validator.getLastError(), false);
            } else {
                callback(null, demandObject);
            }
        } else {
            throw new Error('Callback function is mandatory');
        }
    },
    validateSingleDemand: function (demand, callback) {
        if (typeof callback === 'function') {
            var demandObject;

            if (demand !== null && typeof demand === 'object') {
                demandObject = JSON.parse(JSON.stringify(request)); // TODO: Ugly, but removes 'undefined' values of nested objects...
            } else {
                try {
                    demandObject = JSON.parse(demand);
                } catch (e) {
                    callback(e);
                }
            }

            var valid = validator.validate(demandObject, demandSchema, {schemaPath: "properties.demands.items"});

            if (!valid) {
                callback(validator.getLastError(), false);
            } else {
                callback(null, demandObject);
            }
        } else {
            throw new Error('Callback function is mandatory');
        }
    }
};
