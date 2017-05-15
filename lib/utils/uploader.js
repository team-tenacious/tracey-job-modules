'use strict';

module.exports = Uploader;

function Uploader() {
}

Uploader.prototype.upload = function (context) {

    var test_metrics = require('test-metrics');

    test_metrics(context.test_metrics, context.test_results, function (e) {

        return new Promise(function(resolve, reject){
            if (e)
                reject(e);

            resolve(context);
        });
    });
};
