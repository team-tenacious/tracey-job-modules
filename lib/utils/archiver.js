module.exports = Archiver;

var fs = require('fs');
var path = require('path');
var archiver = require('archiver');

function Archiver() {
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

Archiver.prototype.__createDir = function (dirPath, callback) {

    var createDir = function (path) {
        try {
            fs.statSync(path);
        } catch (e) {
            fs.mkdirSync(path);
        }
    };

    var frags = dirPath.split(path.sep);
    var currPos = 0;
    var currPath = '';

    switch (frags[0]) {
        case '.':
            currPath = '.' + path.sep + frags[1];
            currPos = 2;
            break;
        case '':
            currPath = frags[1];
            currPos = 2;
            break;
        default:
            currPath = frags[0];
            currPos = 1;
            break;
    }

    createDir(currPath);

    while (currPos < frags.length) {
        currPath += path.sep + frags[currPos];
        createDir(currPath);
        currPos++;
    }

    callback();
};