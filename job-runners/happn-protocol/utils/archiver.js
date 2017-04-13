module.exports = Archiver;

var fs = require('fs');
var archiver = require('archiver');

function Archiver() {
}

Archiver.prototype.createTar = function (sourceFolder, targetFile, callback) {

    var output = fs.createWriteStream(targetFile);
    var archive = archiver('tar', {
        store: true
    });

    output.on('close', function () {
        callback();
    });

    archive.on('error', function (err) {
        callback(err)
    });

    archive.pipe(output);
};