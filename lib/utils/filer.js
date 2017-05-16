'use strict';

var join = require('path').join;
var fs = require('fs');

module.exports = Filer;

function Filer() {
}

Filer.prototype.getPackageJSON = function (folder) {
    if (!this.__stat(join(folder, 'package.json')))
        return 'package.json does not exist in the current directory';

    return require(join(folder, 'package.json'));
};

Filer.prototype.writeJSONFile = function (path, data, callback) {

    fs.writeFile(path, JSON.stringify(data), function (e) {

        if (e)
            return callback(e);

        callback();
    });
};

Filer.prototype.copy = function (src, dest) {
    try {
        var source = fs.readFileSync(src);

        fs.writeFileSync(dest, source);
    } catch (err) {

    }
};

Filer.prototype.__stat = function (path) {
    try {
        return fs.statSync(path);
    } catch (_) {
        return false;
    }
};