var constants = require('./constants');
var l4ep = require('./model/Layer4Endpoint.js');

module.exports = {
    /**
     *
     * @param shorthand must be a single object like {"key":"value"}
     * @param callback
     */
    validateShorthand: function (shorthand) {
        console.log(shorthand);
        for (var key in shorthand) {
            var value = shorthand[key];
            var currType = constants[key.toUpperCase()];
            if (typeof currType !== 'undefined') {
                var regex = constants['REGEX_' + currType];
                var re = new RegExp(regex);
                if (re.test(value)) {
                    switch (currType) {
                        case "TCP":
                            return new l4ep(currType, value);
                            break;
                        default:
                            throw new Error('Object creation for ' + currType + 'not yet implemented!');
                    }
                } else {
                    throw new Error('Given shorthand value is invalid.');
                }
            } else {
                throw new Error('Given shorthand key is invalid.');
            }
        }
    }
};