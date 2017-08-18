module.exports = Archiver;

var fs = require('fs');
var path = require('path');
var archiver = require('archiver');
var Commander = require('./commander');
var Filer = require('./filer');
var decompress = require('decompress');

function Archiver() {
    this.__commander = new Commander();
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