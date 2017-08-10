module.exports = {
    HappnProtocolRunner: require('./lib/job-runners/happn-protocol/runner'),
    HappnerProtocolRunner: require('./lib/job-runners/happner-protocol/runner'),
    PerformanceTrackerRunner: require('./lib/job-runners/performance-tracker-lite/runner'),
    Utils: {}
};

var exports = module.exports;

// export the utils
require('fs').readdirSync(__dirname + '/lib/utils').forEach(function (file) {
    var name = formatName(file.replace('.js', ''));
    exports.Utils[name] = require(__dirname + '/lib/utils/' + file);
});

function formatName(s) {

    var capitalise = function (str) {
        return str && str[0].toUpperCase() + str.slice(1);
    };

    if (s.indexOf('-') > -1) {
        var strArr = s.split('-');
        var result = '';

        strArr.forEach(function (x) {
            result += capitalise(x);
        });

        return result;
    } else
        return capitalise(s);
}