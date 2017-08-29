var expect = require('expect.js');
var path = require('path');
var fs = require('fs');

describe('unit - archiver', function () {

    this.timeout(30000);

    context('', function () {

        before('setup', function (done) {
            var Archiver = require('../../../lib/utils/archiver');

            this.__archiver = new Archiver();

            this.__folder1 = '/artifacts/test';
            this.__folder2 = './artifacts/test';
            this.__folder3 = 'artifacts/test2';
            this.__folder4 = 'artifacts/archive1';

            done();
        });

        it('successfully creates nested directory with dot path', function (done) {

            var self = this;

            self.__archiver.__createDir(self.__folder2, function (err) {
                if (err)
                    return done(err);

                self.__archiver.__removeDir(self.__folder2, function (err) {
                    if (err)
                        return done(err);

                    done();
                })
            });
        });

        it('successfully creates nested directory', function (done) {
            var self = this;

            self.__archiver.__createDir(self.__folder3, function (err) {
                if (err)
                    return done(err);

                self.__archiver.__removeDir(self.__folder3, function (err) {
                    if (err)
                        return done(err);

                    done();
                })
            });
        });

        it('successfully archives and unarchives', function (done) {
            var self = this;

            self.__archiver.__createDir(self.__folder4, function (err) {
                if (err)
                    return done(err);

                var fileToArchive = path.resolve('./test'); // archive the test directory

                self.__archiver.createArchive(fileToArchive, self.__folder4, 'blah', function (err) {
                    if (err)
                        return done(err);

                    self.__archiver.unArchive(self.__folder4 + '/blah.tar', self.__folder4, function (err) {

                        if (err)
                            return done(err);

                        var exists = fs.existsSync(path.join(self.__folder4, path.sep, 'unit'));

                        expect(exists).to.equal(true);

                        self.__archiver.__removeDir(self.__folder4, function (err) {
                            if (err)
                                return done(err);

                            done();
                        })
                    });
                });

            });
        });
    });
});
