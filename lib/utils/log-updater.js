
module.exports = LogUpdater;

var logUpdater = require('log-update');

function LogUpdater() {
}

LogUpdater.prototype.done = function () {
    return logUpdater.done();
};