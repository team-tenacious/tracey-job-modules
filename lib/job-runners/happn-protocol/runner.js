module.exports = HappnProtocolRunner;

var async = require('async');
var path = require('path');

var EventEmitter = require('events').EventEmitter;
var JobParser = require('../../parsers/job-parser');
var Commander = require('../../utils/commander');
var Comparer = require('../../utils/comparer');

function HappnProtocolRunner(job, commander = null, comparer = null) {

    var parser = new JobParser();
    this.__currentJob = parser.parseJob(job);

    this.__commander = commander || new Commander();
    this.__comparer = comparer || new Comparer();

    this.events = new EventEmitter();
}

HappnProtocolRunner.prototype.start = function (callback) {

    var self = this;

    self.__emit('info', 'starting runner, repo: ' + self.__currentJob.repo);

    // STEP 1: clone repo - this would already have been done by Tracey

    async.waterfall([
        function (cb1) {
            // STEP 2: run npm install
            self.__emit('running npm install');
            console.log('NPM INSTALL START');

            self.__commander.run('cd ' + self.__currentJob.folder + ' && npm install', function (err, result) {
                if (err) {
                    console.log(err);
                    return cb1(err);
                }

                console.log('RESULT: ' + result);
                cb1();
            });
        },
        function (cb2) {
            // STEP 3: run describe
            self.__emit('running describe');
            console.log('NPM RUN DESCRIBE');

            self.__commander.run('cd ' + self.__currentJob.folder + '&& npm run describe', function (err, result) {
                if (err) {
                    console.log(err);
                    return cb2(err);
                }

                console.log('RESULT: ' + result);
                cb2();
            });
        },
        function (cb3) {
            // STEP 4: run Git add
            self.__emit('comparing');
            console.log('COMPARING');

            var happn2Current = self.__currentJob.folder + path.sep + 'automated-docs' + path.sep + 'happn-2' +
                path.sep + 'current' + path.sep + 'protocol.md';

            var happn3Current = self.__currentJob.folder + path.sep + 'automated-docs' + path.sep + 'happn-3' +
                path.sep + 'current' + path.sep + 'protocol.md';

            self.__comparer.fileCompare(happn2Current, happn3Current, function (err, result) {
                if (err)
                    return cb3(err);

                cb3(null, result);
            });
        }
    ], function (err, result) {
        if (err)
            return callback(err);

        callback(null, result);
    });
};

HappnProtocolRunner.prototype.__updateState = function (state, message, context) {
    this.__emit('test-progress', {state: state, message: message, context: context});
};

HappnProtocolRunner.prototype.__emit = function (evt, data) {
    return this.events.emit(evt, data);
};

HappnProtocolRunner.prototype.on = function (evt, handler) {
    return this.events.on(evt, handler);
};

HappnProtocolRunner.prototype.removeListener = function (evt, handler) {
    return this.events.removeListener(evt, handler);
};


