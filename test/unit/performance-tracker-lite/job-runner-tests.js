var expect = require('expect.js');
var path = require('path');

var Tester = require('../../../lib/utils/tester');
var Runner = require("../../../lib/job-runners/performance-tracker-lite/runner");
var VersionUtil = require("../../../lib/utils/versioner");
var StateUpdater = require("../../../lib/utils/state-updater");
var Uploader = require("../../../lib/utils/uploader");
var LogUpdater = require("../../../lib/utils/log-updater");
var BlackBoard = require("../../../lib/utils/blackboard");
var FileResolver = require("../../../lib/utils/filer");

var Mocker = require('mini-mock');

describe('unit - performance-tracker-lite job-runner', function () {

    this.timeout(30000);

    context('', function () {

        beforeEach('setup', function (done) {

            this.__mocker = new Mocker();

            this.__mockTester = this.__mocker.mock(Tester.prototype)
                .withSyncStub("test", new Promise(function (resolve, reject) {
                    resolve({blah: 'blah'})
                }))
                .create();

            this.__mockVersionUtil = this.__mocker.mock(VersionUtil.prototype)
                .withSyncStub("getVersions", ['6'])
                .create();

            this.__mockStateUpdater = this.__mocker.mock(StateUpdater.prototype)
                .withSyncStub("updateState")
                .create();

            this.__mockUploader = this.__mocker.mock(Uploader.prototype)
                .withSyncStub("upload", new Promise(function (resolve, reject) {
                    resolve({});
                }))
                .create();

            this.__mockLogUpdater = this.__mocker.mock(LogUpdater.prototype)
                .withSyncStub("done")
                .create();

            this.__mockBlackBoard = this.__mocker.mock(BlackBoard.prototype)
                .withSyncStub("chalkRed")
                .create();

            this.__mockFiler = this.__mocker.mock(FileResolver.prototype)
                .withSyncStub("getPackageJSON", {
                    name: 'test-package', version: '1.0.0',
                    description: 'Test package.json', main: 'index.js'
                })
                .withAsyncStub("writeJSONFile")
                .create();

            done();
        });

        afterEach('stop', function (done) {
            done();
        });


        it('successfully executes', function (done) {

            var self = this;
            var mockJob = createMockJob();

            var runner = new Runner(mockJob,
                this.__mockTester,
                this.__mockVersionUtil,
                this.__mockStateUpdater,
                this.__mockUploader,
                this.__mockLogUpdater,
                this.__mockBlackBoard,
                this.__mockFiler);

            runner.start(function (e, result) {
                if (e)
                    return done(e);

                // assertions
                expect(self.__mockTester.recorder['test'].calls).to.equal(1);
                expect(self.__mockVersionUtil.recorder['getVersions'].calls).to.equal(1);
                expect(self.__mockStateUpdater.recorder['updateState'].calls).to.equal(3);
                expect(self.__mockUploader.recorder['upload'].calls).to.equal(1);
                expect(self.__mockLogUpdater.recorder['done'].calls).to.equal(1);
                expect(self.__mockBlackBoard.recorder['chalkRed'].calls).to.equal(0);
                expect(self.__mockFiler.recorder['getPackageJSON'].calls).to.equal(1);
            });

            runner.on('run-complete', function () {
                // call done only when we receive the run-complete event
                done();
            });

        });

        it('raises an error from the Tester', function (done) {

            var self = this;

            var testerError = {error: 'Tester error!'};
            var expectedError = {'6': testerError}; // node 6, with errors

            this.__mockTester = this.__mocker.mock(Tester.prototype)
                .withSyncStub("test", new Promise(function (resolve, reject) {
                    reject(testerError)
                }))
                .create();

            var mockJob = createMockJob();

            var runner = new Runner(mockJob,
                this.__mockTester,
                this.__mockVersionUtil,
                this.__mockStateUpdater,
                this.__mockUploader,
                this.__mockLogUpdater,
                this.__mockBlackBoard,
                this.__mockFiler);

            runner.start(function (e, result) {

                // assertions
                expect(self.__mockTester.recorder['test'].calls).to.equal(1);
                expect(self.__mockVersionUtil.recorder['getVersions'].calls).to.equal(1);

                if (e) {
                    expect(e).to.eql(expectedError);
                    return done();
                }

                done(new Error('Error was expected!'));
            });

        });

        it('raises an error from the Uploader', function (done) {

            var self = this;

            var uploadError = {error: 'Upload rejected!'};
            var expectedError = {'6': uploadError}; // node 6, with errors

            this.__mockUploader = this.__mocker.mock(Uploader.prototype)
                .withSyncStub("upload", new Promise(function (resolve, reject) {
                    reject(uploadError);
                }))
                .create();

            var mockJob = createMockJob();

            var runner = new Runner(mockJob,
                this.__mockTester,
                this.__mockVersionUtil,
                this.__mockStateUpdater,
                this.__mockUploader,
                this.__mockLogUpdater,
                this.__mockBlackBoard,
                this.__mockFiler);

            runner.start(function (e, result) {

                if (e) {
                    expect(e).to.eql(expectedError);
                    return done();
                }

                done(new Error('Error was expected!'));
            });

        });

    });


    function createMockJob() {

        return {
            folder: path.sep + "blah",
            message: {
                config: {},
                job_type: {
                    settings: {}
                },
                event: {
                    owner: 'Bob'
                }
            },
            config: {
                testFolder: '/'
            }
        };
    };
});
