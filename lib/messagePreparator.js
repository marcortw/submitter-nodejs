module.exports = {
    jsonFromObj: function (demandObj, callback) {
        // TODO: Wrap the message within an application etc.
        callback(null, JSON.stringify(demandObj));
    }
};