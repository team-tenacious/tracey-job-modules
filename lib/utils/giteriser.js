module.exports = GitUtils;

var git = require('simple-git')();

function GitUtils() {
}

GitUtils.prototype.clone = function (repo, targetFolder, callback) {

    git.clone(repo, targetFolder, null, function (e) {
        if (e)
            return callback(e);

        callback();
    })
};

GitUtils.prototype.add = function (files, callback) {

    git.add(files, function (e) {
        if (e)
            return callback(e);

        callback();
    })
};

GitUtils.prototype.commit = function (message, callback) {

    git.commit(message, function (e) {
        if (e)
            return callback(e);

        callback();
    })
};