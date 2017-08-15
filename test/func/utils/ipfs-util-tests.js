var expect = require('expect.js');
var path = require('path');
var fs = require('fs');

describe('unit - ipfs-util', function () {

    this.timeout(300000);

    context('', function () {

        before('setup', function (done) {

            var self = this;

            this.__ipfsUtil = new (require('../../../lib/utils/ipfs-util'))();

            this.__ipfsUtil.init({
                ipfs: {
                    host: '127.0.0.1',
                    port: 5001
                }
            });

            this.__testFolder = path.join(__dirname, path.sep, '..', path.sep, '..', path.sep, 'tmp');
            this.__testIpfsFolder = path.join(this.__testFolder, 'ipfs_files');
            this.__testUnarchivedFolder = path.join(this.__testIpfsFolder, 'untarred');

            this.__repoFolder = path.join(__dirname, path.sep, '..', path.sep, '..', path.sep, 'tmp', 'repos', 'happn');
            this.__largeTestFolder = path.join(this.__repoFolder, 'node_modules');
            this.__largeTestArchiveName = 'large_test_file';
            this.__largeTestArchivePath = path.join(this.__testFolder, this.__largeTestArchiveName + '.tar');

            var Archiver = require('../../../lib/utils/archiver');
            this.__archiver = new Archiver();

            // clone the test repo and npm install
            cloneAndNpmInstall(this.__repoFolder, function (err, result) {

                if (err)
                    return done(err);

                done();
            });
        });

        after('cleanup', function (done) {

            fs.unlink(this.__repoFolder, function (err, result) {
                if (err)
                    return done(err);

                done();
            });
        });

        it('successfully saves and retrieves a large tar file from IPFS', function (done) {

            var self = this;

            self.__archiver.createArchive(self.__largeTestFolder, self.__testFolder, self.__largeTestArchiveName, function (err, result) {
                if (err)
                    return done(err);

                // add to ipfs
                self.__ipfsUtil.uploadTar(self.__largeTestArchivePath, function (err, hashKey) {
                    if (err)
                        return done(err);

                    console.log(hashKey);

                    // remove local tar
                    fs.unlink(self.__largeTestArchivePath, function (err, result) {
                        if (err)
                            return done(err);

                        // get from ipfs
                        self.__ipfsUtil.getTar(hashKey, self.__largeTestArchivePath, function (err, result) {
                            if (err)
                                return done(err);

                            // unarchive
                            self.__archiver.unArchive(self.__largeTestArchivePath, self.__testUnarchivedFolder, function (err, result) {

                                if (err)
                                    return done(err);

                                done();
                            });

                        });
                    });
                })
            });
        });
    });

    function cloneAndNpmInstall(targetFolder, callback) {

        var commander = new (require('../../../lib/utils/commander'))();

        var repo = "https://github.com/happner/happn.git";

        commander.run('mkdir -p ' + targetFolder, function (err, result) {

            if (err)
                return callback(err);

            var giteriser = new (require('../../../lib/utils/giteriser'))(targetFolder);

            // clone the repo to temp
            giteriser.clone(repo, targetFolder, function (err, result) {

                if (err)
                    callback(err);

                commander.run('cd ' + targetFolder + ' && npm install', function (err, result) {

                    if (err)
                        return callback(err);

                    callback();
                });
            });
        });
    }
});
