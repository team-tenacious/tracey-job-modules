
module.exports = Stater;

var logUpdate = require('log-update');
var figures = require('figures');
var table = require('text-table');
var chalk = require('chalk');

var states = require('./../job-runners/performance-tracker-lite/states');

function Stater() {
}

Stater.prototype.updateState = function (state) {

    var items = Object.keys(state).map(function (version) {
        var message;
        var icon;

        var currentState = state[version];

        if (currentState === states.cleaning) {
            message = chalk.grey('cleaning up');
            icon = chalk.grey(figures.circleDotted);
        }

        if (currentState === states.running) {
            message = chalk.grey('running');
            icon = chalk.grey(figures.circleDotted);
        }

        if (currentState === states.success) {
            message = chalk.green('success');
            icon = chalk.green(figures.tick);
        }

        if (currentState === states.error) {
            message = chalk.red('error');
            icon = chalk.red(figures.cross);
        }

        if (currentState === states.uploading) {
            message = chalk.blue('uploading');
            icon = chalk.red(figures.circleDotted);
        }

        return [' ', icon, version + ':', message];
    });

    var output = '\n' + table(items, {align: ['l', 'l', 'r', 'l']});

    logUpdate(output);
};
