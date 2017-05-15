'use strict';

var join = require('path').join;
var fs = require('fs');

module.exports = FileResolver;

function FileResolver(){}

FileResolver.prototype.getPackageJSON = function(folder){
    if (!this.__stat(join(folder, 'package.json')))
        return 'package.json does not exist in the current directory';

    return require(join(folder, 'package.json'));
};

FileResolver.prototype.__stat = function(path) {
    try {
        return fs.statSync(path);
    } catch (_) {
        return false;
    }
};