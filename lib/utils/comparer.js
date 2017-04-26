module.exports = Comparer;

function Comparer() {
    this.__fs = require('fs');
    this.__diff = require('fast-diff');
}

Comparer.prototype.fileCompare = function (path1, path2, callback) {

    var self = this;

    var text1 = '';
    var text2 = '';

    self.__fs.readFile(path1, 'utf8', function (err, data) {
        if (err)
            return callback(err);

        text1 = data;

        self.__fs.readFile(path2, 'utf8', function (err, data) {
            if (err)
                return callback(err);

            text2 = data;

            var comparison = null;

            try {
                comparison = self.textCompare(text1, text2);
                callback(null, comparison);
            } catch (err) {
                return callback(err);
            }
        });
    });
};

Comparer.prototype.textCompare = function (text1, text2) {
    return this.__diff(text1, text2);
};