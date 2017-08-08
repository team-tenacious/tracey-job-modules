var expect = require('expect.js');
var path = require('path');

describe('unit - archiver', function () {

    this.timeout(30000);

    context('', function () {

        it('successfully creates nested directory with leading slash', function (done) {

            var Archiver = require('../../../lib/utils/archiver');
            var archiver = new Archiver();

            archiver.__createDir('/artifacts/test', function (err) {
                if (err)
                    return done(err);

                done();
            });
        });

        it('successfully creates nested directory with dot path', function (done) {

            var Archiver = require('../../../lib/utils/archiver');
            var archiver = new Archiver();

            archiver.__createDir('./artifacts/test', function (err) {
                if (err)
                    return done(err);

                done();
            });
        });

        it('successfully creates nested directory', function (done) {

            var Archiver = require('../../../lib/utils/archiver');
            var archiver = new Archiver();

            archiver.__createDir('artifacts/test2', function (err) {
                if (err)
                    return done(err);

                done();
            });
        });
    });
});
