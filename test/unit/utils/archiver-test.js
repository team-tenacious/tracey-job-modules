var expect = require('expect.js');
var path = require('path');

describe('unit - archiver', function () {

    this.timeout(30000);

    context('', function () {

        before('setup', function (done) {
            var Archiver = require('../../../lib/utils/archiver');

            this.__archiver = new Archiver();

            this.__folder1 = '/artifacts/test';
            this.__folder2 = './artifacts/test';
            this.__folder3 = 'artifacts/test2';

            done();
        });

        it('successfully creates nested directory with leading slash', function (done) {

            var self = this;

            self.__archiver.__createDir(self.__folder1, function (err) {
                if (err)
                    return done(err);

                self.__archiver.__removeDir(self.__folder1, function (err) {
                    if (err)
                        return done(err);

                    done();
                })
            });
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
    });
});
