module.exports = Archiver;

var fs = require('fs');
var path = require('path');
var Filer = require('./filer');
var tar = require('tar-fs');

function Archiver() {
    this.__filer = new Filer();
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

    fs.createReadStream(filePath)
        .pipe(tar.extract(targetDir))
        .on('finish', function () {
            callback();
        })
        .on('error', function (err) {
            return callback(err);
        });
};

Archiver.prototype.__createTar = function (sourceFolder, targetFile, callback) {

    tar.pack(sourceFolder)
        .pipe(fs.createWriteStream(targetFile))
        .on('finish', function () {
            callback();
        })
        .on('error', function (err) {
            return callback(err);
        });
};

Archiver.prototype.__createDir = function (dirPath, callback) {

    this.__filer.createFolderRecursive(dirPath, function (err) {

        if (err)
            return callback(err);

        callback();
    });
};

Archiver.prototype.__removeDir = function (path, callback) {

    this.__filer.deleteFolderRecursive(path, function (err) {
        if (err)
            return callback(err);

        callback();
    })
};