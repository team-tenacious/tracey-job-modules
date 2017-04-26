module.exports = GitUtils;

function GitUtils(workingDir) {
    this.__git = require('simple-git')(workingDir);
}

GitUtils.prototype.clone = function (repo, targetFolder, callback) {

    this.__git.clone(repo, targetFolder, null, function (e) {
        if (e)
            return callback(e);

        callback();
    })
};

GitUtils.prototype.add = function (files, callback) {

    this.__git.add(files, function (e) {
        if (e)
            return callback(e);

        callback();
    })
};

GitUtils.prototype.commit = function (message, callback) {

    this.__git.commit(message, function (e) {
        if (e)
            return callback(e);

        callback();
    })
};