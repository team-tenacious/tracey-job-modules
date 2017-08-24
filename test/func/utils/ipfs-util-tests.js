var expect = require('expect.js');
var path = require('path');

describe('unit - ipfs-util', function () {

    this.timeout(300000);

    context('', function () {

        before('setup', function (done) {

            var self = this;

            this.__archiver = new (require('../../../lib/utils/archiver'))();
            this.__ipfsUtil = new (require('../../../lib/utils/ipfs-util'))();
            this.__commander = new (require('../../../lib/utils/commander'))();
            this.__filer = new (require('../../../lib/utils/filer'))();

            this.__testFolder = path.join(__dirname, path.sep, '..', path.sep, '..', path.sep, 'tmp');
            this.__testIpfsFolder = path.join(this.__testFolder, 'ipfs_files');
            this.__testUnarchivedFolder = path.join(this.__testIpfsFolder, 'untarred');

            this.__repoFolder = path.join(__dirname, path.sep, '..', path.sep, '..', path.sep, 'tmp', 'repos', 'happn');
            this.__largeTestFolder = path.join(this.__repoFolder, 'node_modules');
            this.__largeTestArchiveName = 'large_test_file';
            this.__largeTestArchivePath = path.join(this.__testFolder, this.__largeTestArchiveName + '.tar');

            this.__ipfsUtil.init({
                ipfs: {
                    host: '127.0.0.1',
                    port: 5001
                }
            });

            // clone the test repo and npm install
            var repo = "https://github.com/happner/happn.git";

            var user = {
                name: process.env['GITHUB_USER'],
                token: process.env['GITHUB_TOKEN']
            };

            this.__filer.deleteFolderRecursive(this.__repoFolder, function (err) {

                if (err)
                    return done(err);

                console.log('making repo folder....', self.__repoFolder);

                // clone from Github and run npm install
                self.__filer.createFolderRecursive(self.__repoFolder, function (err, result) {

                    if (err)
                        return done(err);

                    var giteriser = new (require('../../../lib/utils/giteriser'))(user, repo, self.__repoFolder);

                    console.log('cloning repo...');

                    // clone the repo to temp
                    giteriser.clone(self.__repoFolder, function (err, result) {

                        if (err)
                            done(err);

                        console.log('running npm install...');

                        self.__commander.run('cd ' + self.__repoFolder + ' && npm install', function (err, result) {

                            if (err)
                                return done(err);

                            done();
                        });
                    });
                });
            });


        });

        after('cleanup', function (done) {

            var self = this;

            self.__filer.deleteFolderRecursive(self.__repoFolder, function (err) {
                if (err)
                    return done(err);

                done();
            });
        });

        it('successfully saves and retrieves a large tar file from IPFS', function (done) {

            var self = this;

            console.log('creating archive...');

            self.__archiver.createArchive(self.__largeTestFolder, self.__testFolder, self.__largeTestArchiveName, function (err, result) {
                if (err)
                    return done(err);

                console.log('uploading tar...');

                // add to ipfs
                self.__ipfsUtil.uploadTar(self.__largeTestArchivePath, function (err, hashKey) {
                    if (err)
                        return done(err);

                    console.log(hashKey);

                    console.log('removing local tar...');

                    // remove local tar
                    self.__commander.run('rm ' + self.__largeTestArchivePath, function (err, result) {
                        if (err)
                            return done(err);

                        console.log('getting from IPFS...');

                        // get from ipfs
                        self.__ipfsUtil.getTar(hashKey, self.__largeTestArchivePath, function (err, result) {
                            if (err)
                                return done(err);

                            console.log('un-archiving...');

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
});
