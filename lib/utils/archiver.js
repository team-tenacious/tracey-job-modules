module.exports = Archiver;

var fs = require('fs');
var archiver = require('archiver');

function Archiver() {
}

Archiver.prototype.createArchive = function(fromFolder, callback){
    var self = this;

    var tempFolder = __dirname + path.sep + 'tmp';
    var archiveName = tempFolder + path.sep + 'archive.tar';

    fs.stat(tempFolder, function (err, stats) {
        if (!stats.isDirectory()) {
            fs.mkdir(tempFolder, function (e) {
                if (e) {
                    return callback(e);
                } else {
                    self.__createTar(fromFolder, archiveName, callback);
                }
            });
        }
    });
};

Archiver.prototype.__createTar = function (sourceFolder, targetFile, callback) {

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