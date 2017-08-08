var expect = require('expect.js');
var path = require('path');

describe('unit - index', function () {

    this.timeout(30000);

    context('', function () {

        it('successfully requires utils', function (done) {

            var index = require('../../index');

            var archiver = index.Archiver;
            console.log(archiver);

            expect(archiver).not.to.be(null);

            done();
        });

    });
});
