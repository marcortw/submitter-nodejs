var fs = require('fs');
var ZSchema = require("z-schema");
var validator = new ZSchema();

var demandSchema = JSON.parse(fs.readFileSync('C:/Users/mschnueriger/Documents/Oxford/MSc/Thesis/schema/combined.schema.v5.json', 'utf8'));

module.exports = {
    validateDemandMessage: function (demand, callback) {
        var demandObject;

        if (demand !== null && typeof demand === 'object') {
            demandObject = demand;
        } else {
            try {
                demandObject = JSON.parse(demand);
            } catch (e) {
                callback(e);
                return;
            }
        }

        var valid = validator.validate(demandObject, demandSchema);

        if (!valid) {
            callback(validator.getLastError(), false);
        } else {
            callback(null, demandObject);
        }
    },
    validateSingleDemand: function (demand, callback) {
        if (typeof callback === 'function') {
            var demandObject;

            if (demand !== null && typeof demand === 'object') {
                demandObject = demand;
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
