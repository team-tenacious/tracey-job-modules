module.exports = Archiver;

var fs = require('fs');
var path = require('path');
var archiver = require('archiver');

function Archiver() {
}

Archiver.prototype.createArchive = function(fromFolder, callback){
    var self = this;

    var tempFolder = path.join(__dirname, '..', path.sep, '..', path.sep, 'tmp');
    var archiveName = tempFolder + path.sep + 'archive.tar';

    fs.stat(tempFolder, function (err, stats) {
        if (stats == null || !stats.isDirectory()) {
            fs.mkdir(tempFolder, function (e) {
                if (e) {
                    return callback(e);
                } else {
                    self.__createTar(fromFolder, archiveName, function(e, result){
                        if(e)
                            return callback(e);

                        console.log(result);
                        callback(null, result);
                    });
                }
            });
        }else{
            self.__createTar(fromFolder, archiveName, function(e, result){
                if(e)
                    return callback(e);

                console.log(result);
                callback(null, result);
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
        .directory(sourceFolder)
        .finalize();

};