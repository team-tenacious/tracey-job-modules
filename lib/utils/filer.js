'use strict';

var join = require('path').join;
var fs = require('fs');
var readline = require('readline');

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

Filer.prototype.lookupDependencyHash = function (filePath, dependencyHash) {

    if (!this.__stat(filePath))
        return null;

    var lineReader = readline.createInterface({
        input: require('fs').createReadStream(filePath)
    });

    lineReader.on('line', function (line) {
        var arr = line.split(':');

        var key = arr[0];
        var value = arr[1];

        if (key == dependencyHash)
            return value;
    });

    return null;
};

Filer.prototype.addLineToFile = function (filePath, lineItem, callback) {

    console.log('adding line to file...');

    var self = this;

    self.findText(filePath, lineItem, function (err, result) {

        if (err)
            return callback(err);

        if (!result) {

            fs.appendFile(filePath, lineItem, function (err) {

                if (err)
                    return callback(err);

                return callback();
            });
        }

        callback();
    });
};

Filer.prototype.findText = function (filePath, text, callback) {

    if (this.__stat(filePath)) {

        fs.readFile(filePath, function (err, result) {
            if (err)
                return callback(err);

            // already exists
            if (result.indexOf(text) > -1)
                return callback(null, true);

            return callback(null, false);
        });
    }

    callback(null, false);
};