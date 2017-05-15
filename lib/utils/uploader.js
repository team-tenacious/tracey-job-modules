'use strict';

module.exports = Uploader;

function Uploader() {
}

Uploader.prototype.upload = function (context, callback) {

    var test_metrics = require('test-metrics');
    test_metrics(context.test_metrics, context.test_results, callback);
};
