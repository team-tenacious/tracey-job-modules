module.exports = Runner;

function Runner(job) {

    this.events = new EventEmitter();

    Object.defineProperty(this, 'job', {value: job});

    //this is to make mocking and injecting these items easier
    this.internals = {}
}

Runner.prototype.__updateState = function (state, message, context) {
    this.__emit('test-progress', {state: state, message: message, context: context});
};

Runner.prototype.start = function (callback) {

    var self = this;

    // STEP 1: clone repo - this would already have been done by Tracey

    // STEP 2: create archive
    this.__createArchive(function (e, result) {

        // STEP 3: run Dockerfile
        var DockerOperations = require('docker-operations');
        var dockerOps = new DockerOperations();

        // create the image
        dockerOps.buildImage(_dirname, require('Dockerfile'), 'happn-protocol', function (e, result) {

            var cmd = 'npm run describe && git add --all && git commit -m "protocol describe run"';
            var containerName = 'happn-protocol-container';

            // create the container
            dockerOps.createContainer('happn-protocol', cmd, containerName, function (e, result) {

                // run the container and report back....
                dockerOps.runContainerAndReport(container, function (e, result) {
                    // STEP 4: report back
                    // TODO: capture the stdout from the container....
                });
            })
        });
    });
};

Runner.prototype.__emit = function (evt, data) {
    return this.events.emit(evt, data);
};

Runner.prototype.on = function (evt, handler) {
    return this.events.on(evt, handler);
};

Runner.prototype.removeListener = function (evt, handler) {
    return this.events.removeListener(evt, handler);
};

Runner.prototype.__createArchive = function (callback) {

    var Archiver = require('./utils/archiver');
    var archiver = new Archiver();

    var tempFolder = __dirname + path.sep + 'tmp';
    var archive = tempFolder + path.sep + 'archive.tar';

    fs.stat(tempFolder, function (err, stats) {
        if (!stats.isDirectory()) {
            fs.mkdir(tempFolder, function (e) {
                if (e) {
                    return callback(e);
                } else {
                    archiver.createTar(self.job.message.folder, archive, callback);
                }
            });
        }
    });
};


