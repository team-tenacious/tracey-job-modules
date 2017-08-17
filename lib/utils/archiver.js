module.exports = Archiver;

var fs = require('fs');
var path = require('path');
var archiver = require('archiver');
var Commander = require('./commander');
var decompress = require('decompress');

function Archiver() {
    this.__commander = new Commander();
}

Archiver.prototype.createArchive = function (fromFolder, toFolder, archiveName, callback) {
    var self = this;

    var tarballName = archiveName + '.tar';
    var targetFile = path.join(toFolder, tarballName);

    self.__createDir(toFolder, function (e) {
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
};

Archiver.prototype.unArchive = function (filePath, targetDir, callback) {

    decompress(filePath, targetDir)
        .then(function () {
            callback();
        })
        .catch(function (err) {
            callback(err);
        })
};

Archiver.prototype.__createTar = function (sourceFolder, targetFile, callback) {

    var output = fs.createWriteStream(targetFile);

    var archive = archiver('tar');

    output.on('close', function () {
        callback();
    });

    archive.on('error', function (err) {
        console.log(err);
        callback(err)
    });

    archive.pipe(output);
    archive
        .directory(sourceFolder, '')
        .finalize();
};

Archiver.prototype.__createDir = function (dirPath, callback) {

    var self = this;

    fs.stat(dirPath, function (err, result) {

        if (err != null) {
            if (err.code == 'ENOENT'){
                self.__commander.run('mkdir -p ' + dirPath, function (err, result) {
                    if (err)
                        return callback(err);
                });
            }
        }

        callback();
    });
};

Archiver.prototype.__removeDir = function (path, callback) {
    fs.rmdir(path, function (err) {
        if (err) {
            console.log(err);
            return callback(err);
        }

        callback();
    });
};