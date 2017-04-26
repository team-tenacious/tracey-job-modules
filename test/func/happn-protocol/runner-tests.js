var expect = require('expect.js');
var path = require('path');
var command = require('node-cmd');

var Giteriser = require('../../../lib/utils/giteriser');
var Runner = require("../../../lib/job-runners/happn-protocol/runner");

describe('unit - happn-protocol job-runner', function () {

    this.timeout(1200000);

    context('', function () {

        beforeEach('setup', function (done) {

            var self = this;
            this.__giteriser = new Giteriser();

            this.__config = {github: {user: process.env.GITHUB_USER, token: process.env.GITHUB_TOKEN}};

            this.__job = {
                repo: "https://github.com/happner/happn-protocol.git",
                folder: path.join(__dirname, '..', path.sep, '..', path.sep, 'tmp', path.sep, 'repos', path.sep, 'happn-protocol')
            };

            // cleanup - CAREFUL!!!
            command.get('rm -R ' + self.__job.folder, function(err, data, stderr){

                if(err)
                    console.log(err);

                // clone the repo to temp
                self.__giteriser.clone(self.__job.repo, self.__job.folder, function (e, result) {
                    if (e)
                        done(e);

                    done();
                });
            });
        });

        afterEach('stop', function (done) {
            done();
        });

        context('start', function () {

            it('successfully executes', function (done) {

                var self = this;

                var runner = new Runner(self.__job, self.__config, self.__giteriser);

                runner.start(function (e, result) {

                    if (e)
                        return done(e);

                    done();
                });
            });
        });
    });
});
