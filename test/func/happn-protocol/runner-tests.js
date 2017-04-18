var expect = require('expect.js');
var path = require('path');

var GitUtils = require('../../lib/git-utils');
var Dockeriser = require("../../../lib/utils/dockeriser");
var Archiver = require('../../../lib/utils/archiver');
var Runner = require("../../../lib/job-runners/happn-protocol/runner");

describe('unit - happn-protocol job-runner', function () {

    this.timeout(1200000);

    context('', function () {

        beforeEach('setup', function (done) {

            this.__gitUtils = new GitUtils();
            this.__dockeriser = new Dockeriser();
            this.__archiver = new Archiver();

            done();
        });

        afterEach('stop', function (done) {
            done();
        });

        context('start', function () {

            it('successfully executes', function (done) {

                var self = this;

                var job = {
                    repo: "https://github.com/happner/happn-protocol.git",
                    folder: path.join(__dirname, '..', path.sep, '..', path.sep, 'tmp', path.sep, 'repos', path.sep, 'happn-protocol')
                };

                self.__gitUtils.clone(job.repo, job.folder, function (e, result) {
                    var runner = new Runner(job, self.__dockeriser, self.__archiver);

                    runner.start(function (e, result) {
                        done(e, result);
                    });

                    //done();
                })
            });

        });
    });
});
