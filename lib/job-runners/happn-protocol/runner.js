module.exports = HappnProtocolRunner;

var async = require('async');
var path = require('path');

var EventEmitter = require('events').EventEmitter;
var JobParser = require('../../parsers/job-parser');
var Commander = require('../../utils/commander');
var Giteriser = require('../../utils/giteriser');

function HappnProtocolRunner(job, commander = null, giteriser = null) {

    var parser = new JobParser();
    this.__currentJob = parser.parseJob(job);

    this.__commander = commander || new Commander();
    this.__giteriser = giteriser || new Giteriser(this.__currentJob.folder);

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
                if (err)
                    return cb1(err);

                cb1();
            });
        },
        function (cb2) {
            // STEP 3: run describe
            self.__emit('running describe');
            console.log('NPM RUN DESCRIBE');

            self.__commander.run('cd ' + self.__currentJob.folder + '&& npm run describe', function (err, result) {
                if (err)
                    return cb2(err);

                cb2();
            });
        },
        function (cb3a) {

            // STEP 4: add to Git
            self.__emit('diffing');
            console.log('DIFFING');

            self.__giteriser.diff(function (err, result) {
                if (err) {
                    console.log('ERROR: ', err);
                    cb3a(err);
                }

                console.log('DIFF: ', result);

                cb3a(null);
                //callback();
            });
        },
        function (cb3) {

            // STEP 4: add to Git
            self.__emit('adding to Git');
            console.log('ADDING TO GIT');

            self.__giteriser.add('./*', function (err) {
                if (err) {
                    console.log('ERROR: ', err);
                    cb3(err);
                }

                cb3(null);
            });
        },
        function (cb4) {

            // STEP 5: commit to Git
            self.__emit('committing to Git');
            console.log('COMMITTING TO GIT');

            self.__giteriser.commit('protocol describe run', function (err) {
                if (err) {
                    console.log('ERROR: ', err);
                    cb4(err);
                }

                cb4(null);
            });
        },
        function (cb5) {

            // STEP 5: push to Git
            self.__emit('pushing to Git');
            console.log('PUSHING TO GIT');

            self.__giteriser.status(function(err, result){
                if(err)
                    cb5(err);

                var currentBranch = result.current;

                self.__giteriser.push('origin', currentBranch, function (err) {
                    if (err) {
                        console.log('ERROR: ', err);
                        cb5(err);
                    }

                    cb5(null);
                });
            });
        }
    ], function (err, result) {
        if (err)
            return callback(err);

        callback(null);
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


