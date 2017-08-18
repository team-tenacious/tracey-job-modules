module.exports = GitUtils;

function GitUtils(user, repo, workingDir) {

    this.__repo = repo;
    this.__remote = 'https://' + user.name + ':' + user.token + '@' + repo;

    this.__git = require('simple-git')(workingDir)
        .silent(true)
        .addConfig('user.name', user.name)
        .addConfig('user.email', user.email);
}

GitUtils.prototype.clone = function (targetFolder, callback) {

    var self = this;

    this.__git.clone(self.__repo, targetFolder, null, function (e) {
        if (e)
            return callback(e);

        callback();
    })
};

GitUtils.prototype.fetch = function (branch, callback) {

    var self = this;

    this.__git.fetch(self.__remote, branch, function (e) {
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

    this.__git
        .commit(message, function (e) {
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

GitUtils.prototype.diff = function (callback) {

    var options = ['--minimal'];

    this.__git.diff(options, function (e, result) {
        if (e)
            return callback(e);

        callback(null, result);
    })
};

GitUtils.prototype.push = function (branch, callback) {

    var self = this;

    this.__git.push(branch, function (e) {
        if (e)
            return callback(e);

        callback();
    })
};