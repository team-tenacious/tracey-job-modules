
var fetchStableVersion = require('stable-node-version');

module.exports = Versioner;

function Versioner() {
}

Versioner.prototype.getVersions = function (config) {

    return (config.node_js || ['stable']).map(function (version) {
        if (version === 'stable') return fetchStableVersion();
        return version;
    });
};
