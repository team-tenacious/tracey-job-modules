var expect = require('expect.js');
var path = require('path');

var Dockeriser = require("../../../lib/utils/dockeriser");
var Archiver = require('../../../lib/utils/archiver');
var Runner = require("../../../lib/job-runners/happn-protocol/runner");

var Mocker = require('mini-mock');

describe('unit - happn-protocol job-runner', function () {

    this.timeout(30000);

    context('', function () {

        beforeEach('setup', function (done) {

            var mocker = new Mocker();

            this.__mockDockeriser = mocker.mock(Dockeriser.prototype)
                .withAsyncStub("buildImage")
                .withAsyncStub("createContainer")
                .withAsyncStub("runContainerAndReport")
                .create();

            this.__mockArchiver = mocker.mock(Archiver.prototype)
                .withAsyncStub("createArchive", [null, 'blah'])
                .create();

            done();
        });

        afterEach('stop', function (done) {
            done();
        });

        context('start', function () {

            it('successfully executes', function (done) {

                var self = this;

                var mockJob = {folder: path.sep + "blah"};

                var runner = new Runner(mockJob, this.__mockDockeriser, this.__mockArchiver);

                runner.start(function (e, result) {

                    expect(self.__mockArchiver.recorder['createArchive'].calls).to.equal(1);
                    expect(self.__mockDockeriser.recorder['buildImage'].calls).to.equal(1);
                    expect(self.__mockDockeriser.recorder['createContainer'].calls).to.equal(1);
                    expect(self.__mockDockeriser.recorder['runContainerAndReport'].calls).to.equal(1);

                    done(e, result);
                });

            });

        });
    });
});
