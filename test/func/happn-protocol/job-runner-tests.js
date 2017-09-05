var expect = require('expect.js');
var path = require('path');
var fs = require('fs');

var Giteriser = require('../../../lib/utils/giteriser');
var Comparer = require('../../../lib/utils/comparer');
var Commander = require('../../../lib/utils/commander');
var Runner = require("../../../lib/job-runners/happn-protocol/runner");

describe('unit - happn-protocol job-runner', function () {

    this.timeout(1200000);

    context('', function () {

        before('setup', function (done) {

            var self = this;
            self.__comparer = new Comparer();
            self.__commander = new Commander();



            this.__job = {
                id: '1495026781536_01250553-e840-4142-ace0-38cbdb0201d2',
                message: {
                    repo: "github.com/happner/happn-protocol.git",
                    event: {
                        type: 'push',
                        name: 'happn-protocol',
                        owner: 'happner',
                        branch: 'master'
                    },
                    folder: path.join(__dirname, '..', path.sep, '..', path.sep, 'tmp', path.sep, 'repos', path.sep, 'happn-protocol'),
                    config: {
                        github: {
                            user: {
                                name: process.env['GITHUB_USER'],
                                token: process.env['GITHUB_TOKEN']
                            }
                        }
                    }
                }
            };

            self.__commander.run('rm -R ' + self.__job.message.folder, function (err) {   // remove temp folder - CAREFUL!!!!!

                // make a new temp dir
                self.__commander.run('mkdir -p ' + self.__job.message.folder, function (err) {

                    if (err)
                        return done(err);

                    self.__giteriser = new Giteriser(self.__job.message.config.github.user, self.__job.message.repo, self.__job.message.folder);

                    // clone the repo to temp
                    self.__giteriser.clone(self.__job.message.folder, function (err, result) {

                        if (err)
                            return done(err);

                        //// switch to the test branch
                        //self.__giteriser.checkout('tracey-runner-updates', function (err, result) {
                        //    if (err)
                        //        done(err);
                        //
                        //    done();
                        //});

                        done();
                    });
                });
            });
        });

        after('stop', function (done) {
            done();
        });

        context('start', function () {

            it('successfully executes', function (done) {

                var self = this;

                var runner = new Runner(self.__job, self.__commander, self.__giteriser);

                runner.start(function (e, result) {

                    if (e)
                        return done(e);

                    //expect(result.length).not.to.be(0);
                    done();
                });
            });
        });
    });
});
