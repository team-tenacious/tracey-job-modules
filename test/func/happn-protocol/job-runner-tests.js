var expect = require('expect.js');
var path = require('path');

var Giteriser = require('../../../lib/utils/giteriser');
var Comparer = require('../../../lib/utils/comparer');
var Commander = require('../../../lib/utils/commander');
var Runner = require("../../../lib/job-runners/happn-protocol/runner");

describe('unit - happn-protocol job-runner', function () {

    this.timeout(1200000);

    context('', function () {

        before('setup', function (done) {

            var self = this;
            this.__giteriser = new Giteriser();
            this.__comparer = new Comparer();
            this.__commander = new Commander();

            this.__job = {
                repo: "https://github.com/happner/happn-protocol.git",
                folder: path.join(__dirname, '..', path.sep, '..', path.sep, 'tmp', path.sep, 'repos', path.sep, 'happn-protocol')
            };

            // cleanup - CAREFUL!!!
            this.__commander.run('rm -R ' + self.__job.folder, function (err, result) {

                if (err)
                    console.log(err);

                // clone the repo to temp
                self.__giteriser.clone(self.__job.repo, self.__job.folder, function (err, result) {
                    if (err)
                        done(err);

                    done();
                });
            });
        });

        after('stop', function (done) {
            done();
        });

        context('start', function () {

            it('successfully executes', function (done) {

                var self = this;

                var runner = new Runner(self.__job, self.__commander, self.__comparer);

                runner.start(function (e, result) {

                    if (e)
                        return done(e);

                    expect(result.length).not.to.be(0);
                    done();
                });
            });
        });
    });
});
