var path = require('path');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var async = require('async');

//var states = require('./states');

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

    this.__tester = tester != null ? tester : new (require('./../../utils/tester'));
    this.__nodeVersionUtil = nodeVersionUtil != null ? nodeVersionUtil : new (require('./../../utils/versioner'));
    this.__stateUpdater = stateUpdater != null ? stateUpdater : new (require('./../../utils/state-updater'));
    this.__uploader = uploader != null ? uploader : new (require('./../../utils/uploader'));
    this.__logUpdater = logUpdater != null ? logUpdater : new (require('./../../utils/log-updater'));
    this.__blackBoard = blackBoard != null ? blackBoard : new (require('../../utils/blackboard'));
    this.__filer = filer != null ? filer : new (require('../../utils/filer'));

    this.__currentJob = job;

    this.__states = {
        running: 1,
        success: 2,
        error: 3,
        uploading: 4
    };
}

TestRunner.prototype.start = function (callback) {

    var self = this;

    this.__emit('info', 'starting runner, repo: ' + self.__currentJob.repo);

    var state = {};
    var errors = {};
    var versions = self.__nodeVersionUtil.getVersions(self.__currentJob.message.config);

    async.eachSeries(versions, function (version, cb) {

        self.__runTests(version, state, errors)
            .then(function () {
                cb();
            })
            .catch(function (err) {
                 return cb(err);
            })

    }, function (e) {

        self.__logUpdater.done();

        if (e){
            self.__displayErrors(e);
            return callback(e);
        }

        callback();
    });
};

TestRunner.prototype.__runTests = function (version, state, errors) {

    var self = this;

    return new Promise(function (resolve, reject) {

        var context = null;

        self.__buildContext(version)

            .tap(function (result) {
                context = result;
                self.__updateState(state, version, self.__states.running, 'running tests', context);
            })
            .then(function () {
                return self.__tester.test(self.__currentJob.config.testFolder);
            })
            .then(function (results) {
                return self.__appendContextTestResults(context, results);
            })
            .tap(function () {
                self.__updateState(state, version, self.__states.uploading, 'uploading metrics', context);
            })
            .then(function () {
                return self.__uploader.upload(context);
            })
            .tap(function () {
                self.__updateState(state, version, self.__states.success, 'run successful', context);
            })
            .then(function () {
                return self.__writeTestResults(context, errors, version, state);
            })
            .tap(function () {
                self.__emit('run-complete', context.test_results);
                resolve();
            })
            .catch(function (err) {
                errors[version] = err;
                self.__updateState(state, version, self.__states.error, 'run failed', context);

                // we are adding errors to an errors object, so just call back
                reject(errors);
            });
    })

};

TestRunner.prototype.__buildContext = function (version) {

    var self = this;

    return new Promise(function (resolve, reject) {

        try {
            var job = self.__currentJob;
            var pkg = self.__filer.getPackageJSON(job.folder);

            var result = {
                version: version,
                name: pkg.name.toLowerCase(),
                module_version: pkg.version,
                path: job.folder,
                test_script: job.message.config.test_script,
                test_metrics: job.message.job_type.settings,
                test_results: {
                    context: {
                        version: pkg.version,
                        node: version,
                        owner: job.message.event.owner,
                        repo: job.message.event.name,
                        branch: job.message.event.branch
                    }
                }
            };

            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
};

TestRunner.prototype.__displayErrors = function (errors) {

    var self = this;

    if (Object.keys(errors).length > 0) {
        // display output from failed node.js versions
        Object.keys(errors).forEach(function (version) {
            self.__blackBoard.chalkRed('  node v' + version + ':');
        });
    }
};

TestRunner.prototype.__appendContextTestResults = function (context, results) {
    return new Promise(function (resolve, reject) {

        try {
            var clonedContext = JSON.parse(JSON.stringify(context.test_results.context));

            context.test_results = results;
            context.test_results.context = clonedContext;

            resolve(context);
        } catch (err) {
            reject(err);
        }
    })
};

TestRunner.prototype.__writeTestResults = function (context) {
    var self = this;

    return new Promise(function (resolve, reject) {
        self.__filer.writeJSONFile(context.path + path.sep + 'test_results_' + context.version + '.json',
            context.test_results, function (err, result) {
                if (err)
                    reject(err);

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