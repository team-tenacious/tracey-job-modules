var expect = require('expect.js');
var path = require('path');

var Giteriser = require("../../../lib/utils/giteriser");
var Commander = require('../../../lib/utils/commander');
var Runner = require("../../../lib/job-runners/happn-protocol/runner");

var Mocker = require('mini-mock');

describe('unit - happn-protocol job-runner', function () {

    this.timeout(30000);

    context('', function () {

        beforeEach('setup', function (done) {

            var mocker = new Mocker();

            this.__mockGiteriser = mocker.mock(Giteriser.prototype)
                .withAsyncStub("add")
                .withAsyncStub("commit")
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

                var runner = new Runner(mockJob, this.__mockCommander, this.__mockGiteriser);

                runner.start(function (e, result) {

                    expect(self.__mockGiteriser.recorder['add'].calls).to.equal(1);
                    expect(self.__mockGiteriser.recorder['commit'].calls).to.equal(1);
                    expect(self.__mockCommander.recorder['run'].calls).to.equal(2);

                    done(e, result);
                });

            });

        });
    });
});
