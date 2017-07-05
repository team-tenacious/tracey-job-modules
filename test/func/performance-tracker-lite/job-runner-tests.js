var expect = require('expect.js');
var path = require('path');
var fs = require('fs');

var Giteriser = require('../../../lib/utils/giteriser');
var Commander = require('../../../lib/utils/commander');
var Runner = require("../../../lib/job-runners/performance-tracker-lite/runner");

describe('unit - performance-tracker-lite job-runner', function () {

    this.timeout(1200000);

    context('', function () {

        before('setup', function (done) {

            var self = this;
            self.__commander = new Commander();

            this.__job = {
                id: '1495026781536_01250553-e840-4142-ace0-38cbdb0201d2',
                message: {
                    repo: 'https://github.com/happner/happn.git',
                    event: {
                        type: 'push',
                        name: 'happn',
                        owner: 'happner',
                        branch: 'master'
                    },
                    config: {
                        owner: 'happner',
                        name: 'happn',
                        testFolder: 'test',
                        job_type: 'performance-tracker-lite',
                        node_js: [6]
                    },
                    job_type: {
                        name: 'performance-tracker-lite',
                        path: '/tracey/lib/job_types/performance-tracker-lite/runner'
                    },
                    folder: path.join(__dirname, '..', path.sep, '..', path.sep, 'tmp', path.sep, 'repos', path.sep, 'happn')
                }
            };

            self.__commander.run('rm -R ' + self.__job.message.folder, function (err) {   // remove temp folder - CAREFUL!!!!!

                // make a new temp dir
                fs.mkdirSync(self.__job.message.folder);

                self.__giteriser = new Giteriser(self.__job.message.folder);

                // clone the repo to temp
                self.__giteriser.clone(self.__job.message.repo, self.__job.message.folder, function (err, result) {
                    if (err)
                        done(err);

                    // switch to the test branch
                    self.__giteriser.checkout('master', function (err, result) {
                        if (err)
                            done(err);

                        done();
                    });
                });
            });
        });

        after('stop', function (done) {
            done();
        });

        context('start', function () {

            it('successfully executes tests but does not upload to Graphite', function (done) {

                var self = this;

                var runner = new Runner(self.__job, null, null, null, null, createMockUploader(), null, null, null);

                runner.start(function (e) {

                    if (e)
                        return done(e);

                    var outputPath = path.join(__dirname, '..', path.sep, '..', path.sep, 'tmp', path.sep, 'repos',
                        path.sep, 'happn', path.sep, 'test_results_6.json');

                    fs.readFile(outputPath, function (err, result) {

                        if(err)
                            return done(err);

                        var testResults = JSON.parse(result);

                        expect(testResults.context).not.to.be(null);
                        expect(testResults.aggregated).not.to.be(null);

                        done();
                    });
                });
            });
        });

        function createMockUploader() {
            return {
                upload: function (context) {
                    return new Promise(function (resolve, reject) {
                        resolve(context);
                    });
                }
            }
        }
    })
    ;
})
;
