module.exports = GitUtils;

var gitclone = require('gitclone');

function GitUtils() {
}

GitUtils.prototype.clone = function (repo, targetFolder, callback) {
    gitclone(repo, {dest: targetFolder}, function (e) {
        if(e)
            console.log('Gitclone error: ', e);
        callback(e);
    })
};