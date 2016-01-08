var fs = require('fs');
var tv4 = require('tv4');

var demandSchema = JSON.parse(fs.readFileSync('C:/Users/mschnueriger/Documents/Oxford/MSc/Thesis/schema/combined.schema.v4.json', 'utf8'));

module.exports = {
    validate: function (demand, callback) {

        try {
            var demandObject = JSON.parse(demand);
        } catch (e) {
            callback(e);
            return;
        }

        var valid = tv4.validate(demandObject, demandSchema);

        if (!valid) {
            callback(tv4.error, false);
        } else {
            callback(null, demandObject);
        }
    }
};
