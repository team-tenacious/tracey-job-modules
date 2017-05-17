'use strict';

module.exports = Tester;

var format = require('util').format;
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var sm = require('happner-serial-mocha');

function Tester() {
    //this.__runUtil = runUtil != null ? runUtil : new (require('run-util'));
}

//Tester.prototype.deserializeTestResults = function (val) {
//    try {
//        return JSON.parse(val.split('::::output results::::')[1]);
//    } catch (e) {
//        throw new Error('failed deserialising test results', e);
//    }
//};

Tester.prototype.test = function (testDir) {

    var self = this;

    return new Promise(function (resolve, reject) {

        var files = [];
        var reportDir = testDir + path.sep + 'reports';

        self.__runTasks(files, reportDir, function (err, result) {

            if (err)
                reject(err);

            fs.readdirSync(testDir).forEach(function (filename) {

                var filePath = testDir + path.sep + filename;
                var file = fs.statSync(filePath);

                if (!file.isDirectory() && filename.indexOf('.js') > -1)
                    files.push(filePath);
            });

            sm.on('suite-ended', function (data) {
                console.log('::::suite-ended::::' + data.report.task);
                console.log(data);
            });

            resolve(result);
        });
    })
};

Tester.prototype.__runTasks = function (files, reportDir, callback) {

    sm.runTasks(files, null, reportDir)

        .then(function (results) {
            //dont remove the ::::output results:::: tags, they are used to take out the test results json
            console.log('::::output results::::');
            console.log(JSON.stringify(results, null, 2));
            console.log('::::output results::::');

            callback(null, results);
        })
        .catch(function (e) {
            console.log('tracey test run broke:::', e);

            return callback(e);
        });
};