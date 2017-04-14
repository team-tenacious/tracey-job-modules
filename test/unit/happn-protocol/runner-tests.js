var expect = require('expect.js');
var path = require('path');

var Dockeriser = require("../../../lib/utils/dockeriser");
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

            done();
        });

        afterEach('stop', function (done) {
            done();
        });

        context('start', function () {

            it('successfully executes', function (done) {

                var runner = new Runner();
                runner.start(function(e, result){
                   done(e, result);
                });

            });

        });
    });
});
