
module.exports = Uploader;

function Uploader() {
}

Uploader.prototype.upload = function (context) {

    return new Promise(function (resolve, reject) {
        var test_metrics = require('test-metrics');

        test_metrics(context.test_metrics, context.test_results, function (err) {
            if (err)
                return reject(err);

            resolve(context);
        });
    })
};
