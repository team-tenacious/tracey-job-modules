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

GitUtils.prototype.fetch = function (remote, branch, callback) {

    this.__git.fetch(remote, branch, function (e) {
        if (e)
            return callback(e);

        callback();
    })
};

GitUtils.prototype.checkout = function (branchName, callback) {

    this.__git.checkout(branchName, function (e) {
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

GitUtils.prototype.status = function (callback) {

    this.__git.status(function (e, result) {
        if (e)
            return callback(e);

        callback(null, result);
    })
};

GitUtils.prototype.push = function (remote, branch, callback) {

    this.__git.push(remote, branch, function (e) {
        if (e)
            return callback(e);

        callback();
    })
};