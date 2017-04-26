module.exports = HappnProtocolRunner;

var async = require('async');
var path = require('path');
var command = require('node-cmd');

var EventEmitter = require('events').EventEmitter;
var JobParser = require('../../parsers/job-parser');
var Giteriser = require('../../utils/giteriser');

function HappnProtocolRunner(job, config = null, giteriser = null) {

    this.__config = config || {};
    this.__giteriser = giteriser || new Giteriser();

    var parser = new JobParser();
    this.__currentJob = parser.parseJob(job);

    this.events = new EventEmitter();
}

HappnProtocolRunner.prototype.start = function (callback) {

    var self = this;

    const containerName = 'happn-protocol-container';

    self.__emit('info', 'starting runner, repo: ' + self.__currentJob.repo);

    console.log('CURRENT JOB FOLDER: ', self.__currentJob.folder);

    // STEP 1: clone repo - this would already have been done by Tracey

    async.waterfall([
        function (cb1) {
            // STEP 2: run npm install
            self.__emit('running npm install');
            console.log('NPM INSTALL START');

            command.get('cd ' + self.__currentJob.folder + ' && npm install', function (err, data, stderr) {
                if (err) {
                    console.log(err);
                    return cb1(err);
                }

                console.log('DATA: ' + data);
                cb1();
            });
        },
        function (cb2) {
            // STEP 3: run describe
            self.__emit('running describe');
            console.log('NPM RUN DESCRIBE');

            command.get('cd ' + self.__currentJob.folder + '&& npm run describe', function (err, data, stderr) {
                if (err)
                    return cb2(err);

                console.log(data);

                cb2();
            })
        },
        function (cb3) {
            // STEP 4: run Git add
            self.__emit('adding to Git');
            console.log('ADD TO GIT');

            self.__giteriser.add('.', function (err) {
                if (err)
                    return cb3(err);

                cb3();
            })
        },
        function (cb4) {
            // STEP 5: run Git commmit
            self.__emit('committing to Git');
            console.log('COMMIT TO GIT');

            self.__giteriser.commit('protocol describe run', function (err) {
                if (err)
                    return cb4(err);

                cb4();
            })
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


