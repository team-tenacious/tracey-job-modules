var path = require('path');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');

var async = require('async');
var states = require('./states');

/*
 In order to facilitate better testing, constructor injection is used here. All dependencies can be mocked for testing.
 - a single parameter object could have been used instead, however this makes the parameter requirements too opaque
 */
function TestRunner(job,
                    tester = null,
                    nodeVersionUtil = null,
                    stateUpdater = null,
                    uploader = null,
                    logUpdater = null,
                    blackBoard = null,
                    filer = null) {

    this.events = new EventEmitter();

    this.__tester = tester != null ? tester : new (require('./test'));
    this.__nodeVersionUtil = nodeVersionUtil != null ? nodeVersionUtil : new (require('./../../utils/versioner'));
    this.__stateUpdater = stateUpdater != null ? stateUpdater : new (require('./../../utils/state-updater'));
    this.__uploader = uploader != null ? uploader : new (require('./../../utils/uploader'));
    this.__logUpdater = logUpdater != null ? logUpdater : new (require('./../../utils/log-updater'));
    this.__blackBoard = blackBoard != null ? blackBoard : new (require('../../utils/blackboard'));
    this.__filer = filer != null ? filer : new (require('../../utils/filer'));

    this.__currentJob = job;
}

TestRunner.prototype.start = function (callback) {

    var self = this;

    self.__emit('info', 'starting runner, repo: ' + self.__currentJob.repo);

    var state = {};
    var errors = {};
    var versions = self.__nodeVersionUtil.getVersions(self.__currentJob.message.config);

    async.eachSeries(versions, function (version, cb) {

        var context = self.__buildContext(version);

        return Promise.resolve(context)

            .tap(function () {
                self.__updateState(state, version, states.running, 'running tests', context);
            })

            .then(self.__tester.test(context))

            .tap(function () {
                self.__updateContextTestResults(context);
                self.__updateState(state, version, states.uploading, 'uploading metrics', context);
            })

            .then(self.__uploader.upload(context))

            .tap(function () {
                self.__updateState(state, version, states.success, 'run successful', context);
            })

            .then(function () {
                self.__writeTestResults(context, errors, version, state);
                self.__emit('run-complete', context.test_results);
                cb();
            })

            .catch(function (err) {
                errors[version] = err;
                self.__updateState(state, version, states.error, 'run failed', context);
                cb(err);
            });

    }, function (e) {

        if (e)
            return callback(e);

        self.__logUpdater.done();

        // display output from failed node.js versions
        Object.keys(errors).forEach(function (version) {
            self.__blackBoard.chalkRed('  node v' + version + ':');
            console.log(errors[version]);
        });

        callback(null, Object);
    });
};

TestRunner.prototype.__buildContext = function (version) {

    var self = this;

    var pkg = self.__filer.getPackageJSON(self.__currentJob.folder);

    return {
        version: version,
        name: pkg.name.toLowerCase(),
        module_version: pkg.version,
        path: self.__currentJob.folder,
        test_script: self.__currentJob.message.config.test_script,
        test_metrics: self.__currentJob.message.job_type.settings,
        test_results: {}
    };
};

TestRunner.prototype.__updateContextTestResults = function (context) {
    var self = this;

    context.test_results.context = {
        version: context.module_version,
        node: context.version,
        owner: self.__currentJob.message.event.owner,
        repo: self.__currentJob.message.event.name,
        branch: self.__currentJob.message.event.branch
    };
};

TestRunner.prototype.__writeTestResults = function (context) {
    var self = this;

    return new Promise(function (resolve, reject) {
        self.__filer.writeJSONFile(context.path + path.sep + 'test_results_' + context.version + '.json',
            context.test_results, function (err, result) {
                if (err)
                    return reject(err);

                resolve(result);
            });
    });
};

TestRunner.prototype.__updateState = function (state, version, status, message, context) {
    state[version] = status;
    this.__stateUpdater.updateState(state);
    this.__emit('test-progress', {state: state, message: message, context: context});
};

TestRunner.prototype.__emit = function (evt, data) {
    return this.events.emit(evt, data);
};

TestRunner.prototype.on = function (evt, handler) {
    return this.events.on(evt, handler);
};

TestRunner.prototype.removeListener = function (evt, handler) {
    return this.events.removeListener(evt, handler);
};

module.exports = TestRunner;