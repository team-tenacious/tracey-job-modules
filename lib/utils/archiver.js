module.exports = Archiver;

var fs = require('fs');
var path = require('path');
var archiver = require('archiver');

function Archiver() {

    // expand fs to ensure that nested directories are created
    fs.mkdirNested = function (dirPath, callback) {
        fs.mkdir(dirPath, function (error) {
            if (error && error.errno === 34) {
                fs.mkdirNested(path.dirname(dirPath), callback);
                fs.mkdirNested(dirPath, callback);
            }
            callback && callback(error);
        });
    };
}

Archiver.prototype.createArchive = function (fromFolder, toFolder, archiveName, callback) {
    var self = this;

    var tarballName = archiveName + '.tar';
    var targetFile = path.join(toFolder, tarballName);

    fs.stat(toFolder, function (err, stats) {
        if (stats == null || !stats.isDirectory()) {
            fs.mkdirNested(toFolder, function (e) {
                if (e) {
                    return callback(e);
                } else {
                    self.__createTar(fromFolder, targetFile, function (e) {
                        if (e)
                            return callback(e);

                        callback(null, tarballName);
                    });
                }
            });
        } else {
            self.__createTar(fromFolder, targetFile, function (e) {
                if (e)
                    return callback(e);

                callback(null, tarballName);
            });
        }
    });
};

Archiver.prototype.__createTar = function (sourceFolder, targetFile, callback) {

    var output = fs.createWriteStream(targetFile);

    var archive = archiver('tar');

    output.on('close', function () {
        console.log('Closing stream....');
        callback();
    });

    archive.on('error', function (err) {
        console.log('Archive error: ', err);
        callback(err)
    });

    archive.pipe(output);
    archive
        .directory(sourceFolder, '')
        .finalize();
};