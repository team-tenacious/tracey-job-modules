module.exports = Archiver;

var fs = require('fs');
var path = require('path');
var Filer = require('./filer');
var tar = require('tar');

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

Archiver.prototype.__createTar = function (sourceFolder, targetFile, callback) {

    tar.c({
        file: targetFile,
        portable: true
    }, [sourceFolder], function (err) {
        if (err)
            return callback(err);

        callback();
    });
};

Archiver.prototype.unArchive = function (filePath, targetDir, callback) {

    tar.x({
        file: filePath,
        unlink: true,
        preserveOwner: false,
        mode: 'a+rwX'
    }, [targetDir], function (err) {

        if (err)
            return callback(err);

        callback(err);
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