var expect = require('expect.js');
var path = require('path');

var Comparer = require("../../../lib/utils/comparer");
var Commander = require('../../../lib/utils/commander');
var Runner = require("../../../lib/job-runners/happn-protocol/runner");

var Mocker = require('mini-mock');

describe('unit - happn-protocol job-runner', function () {

    this.timeout(30000);

    context('', function () {

        beforeEach('setup', function (done) {

            var mocker = new Mocker();

            this.__mockComparer = mocker.mock(Comparer.prototype)
                .withAsyncStub("fileCompare")
                .create();

            this.__mockCommander = mocker.mock(Commander.prototype)
                .withAsyncStub("run")
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

                var runner = new Runner(mockJob, this.__mockCommander, this.__mockComparer);

                runner.start(function (e, result) {

                    expect(self.__mockComparer.recorder['fileCompare'].calls).to.equal(1);
                    expect(self.__mockCommander.recorder['run'].calls).to.equal(2);

                    done(e, result);
                });

            });

        });
    });
});
