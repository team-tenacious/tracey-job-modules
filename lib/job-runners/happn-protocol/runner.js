module.exports = HappnProtocolRunner;

var async = require('async');
var EventEmitter = require('events').EventEmitter;
var JobParser = require('../../parsers/job-parser');
var Archiver = require('../../utils/archiver');
var Dockeriser = require('../../utils/dockeriser');

function HappnProtocolRunner(job, dockeriser = null, archiver = null) {

    this.__dockeriser = dockeriser || new Dockeriser();
    this.__archiver = archiver || new Archiver();

    var parser = new JobParser();
    this.__currentJob = parser.parseJob(job);

    this.events = new EventEmitter();
}

HappnProtocolRunner.prototype.start = function (callback) {

    var self = this;
    const cmd = 'npm run describe && git add --all && git commit -m "protocol describe run"';
    const containerName = 'happn-protocol-container';

    // STEP 1: clone repo - this would already have been done by Tracey

    async.waterfall([
        function (cb1) {
            // STEP 2: create archive
            return self.__archiver.createArchive(self.__currentJob.folder, cb1);
        },
        function (cb2) {
            // STEP 3: run Dockerfile and create image
            return self.__dockeriser.buildImage(__dirname, 'Dockerfile', 'happn-protocol', cb2);
        },
        function (cb3) {
            // STEP 4: create the container
            return self.__dockeriser.createContainer('happn-protocol', cmd, containerName, cb3);
        },
        function (container, cb4) {
            // STEP 5: run the container and report back....
            return self.__dockeriser.runContainerAndReport(container, cb4);
        }
    ], function (err, result) {
        // TODO: capture the stdout from the container....
        callback(err, result);
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


