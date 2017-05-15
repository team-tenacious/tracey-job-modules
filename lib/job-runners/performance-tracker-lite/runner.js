var fs = require('fs-extra');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Promise = require('bluebird');

var async = require('async');
var states = require('./states');

function TestRunner(job,
                    tester = null,
                    nodeVersionUtil = null,
                    stateUpdater = null,
                    uploader = null,
                    logUpdater = null,
                    blackBoard = null,
                    fileResolver = null) {

    this.events = new EventEmitter();

    this.__tester = tester != null ? tester : new (require('./test'));
    this.__nodeVersionUtil = nodeVersionUtil != null ? nodeVersionUtil : new (require('./../../utils/versioner'));
    this.__stateUpdater = stateUpdater != null ? stateUpdater : new (require('./../../utils/state-updater'));
    this.__uploader = uploader != null ? uploader : new (require('./../../utils/uploader'));
    this.__logUpdater = logUpdater != null ? logUpdater : new (require('./../../utils/log-updater'));
    this.__blackBoard = blackBoard != null ? blackBoard : new (require('../../utils/blackboard'));
    this.__fileResolver = fileResolver != null ? fileResolver : new (require('../../utils/file-resolver'));

    this.__currentJob = job;
}

TestRunner.prototype.start = function (callback) {

    try {
        var self = this;

        self.__emit('info', 'starting runner, repo: ' + self.__currentJob.repo);

        var pkg = self.__fileResolver.getPackageJSON(self.__currentJob.folder);
        var state = {};
        var errors = {};
        var versions = self.__nodeVersionUtil.getVersions(self.__currentJob.message.config);

        async.eachSeries(versions, function (version, cb) {

            var context = {
                version: version,
                name: pkg.name.toLowerCase(),
                module_version: pkg.version,
                path: self.__currentJob.folder,
                test_script: self.__currentJob.message.config.test_script,
                test_metrics: self.__currentJob.message.job_type.settings
            };

            // use tap to modify the state without needing to return it from each step
            return Promise.resolve(context)

                .tap(function () {
                    state[version] = states.running;
                    self.__updateState(state, 'running tests', context);
                })

                .then(self.__tester.test)

                .tap(function () {

                    context.test_results.context = {
                        version: context.module_version,
                        node: context.version,
                        owner: self.__currentJob.message.event.owner,
                        repo: self.__currentJob.message.event.name,
                        branch: self.__currentJob.message.event.branch
                    };

                    state[version] = states.uploading;
                    self.__updateState(state, 'uploading metrics', context);
                })

                .then(self.__uploader.upload)

                .tap(function () {

                    state[version] = states.success;
                    self.__updateState(state, 'run successful', context);

                    fs.writeFile(context.path + path.sep + 'test_results_' + context.version + '.json',
                        JSON.stringify(context.test_results), function (e) {

                            if (e) {
                                state[version] = states.error;
                                errors[version] = e;
                                self.__updateState(state, 'run ok, but reporting failed', context);

                                return cb(e);
                            }

                            self.__emit('run-complete', context.test_results);
                            cb();
                        });
                })

                .catch(function (err) {
                    state[version] = states.error;
                    errors[version] = err;
                    self.__updateState(state, 'run failed', context);
                    cb(err);
                });

        }, function (e) {

            if (e)
                return callback(e);

            self.__logUpdater.done();

            // display output from failed node.js versions
            Object.keys(errors).forEach(function (version) {
                console.log('WRITING ERRORS: ', version);
                self.__blackBoard.chalkRed('  node v' + version + ':');
                console.log(errors[version]);
            });

            callback(null, Object);
        });

    } catch (e) {
        return callback(e);
    }
};

TestRunner.prototype.__updateState = function (state, message, context) {
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