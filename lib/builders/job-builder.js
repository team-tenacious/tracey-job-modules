module.exports = JobBuilder;

function JobBuilder() {
}

JobBuilder.prototype.withRepo = function (repo) {
    this.__repo = repo;
    return this;
};

JobBuilder.prototype.withFolder = function (folder) {
    this.__folder = folder;
    return this;
};

JobBuilder.prototype.withConfig = function (config) {
    this.__config = config;
    return this;
};

JobBuilder.prototype.withJobType = function (jobType) {
    this.__jobType = jobType;
    return this;
};

JobBuilder.prototype.withEvent = function (event) {
    this.__event = event;
    return this;
};

JobBuilder.prototype.withGithubConfig = function(config){
    this.__githubConfig = config;
    return this;
};

JobBuilder.prototype.build = function () {

    this.__config.github = this.__githubConfig;

    return {
        repo: this.__repo,
        folder: this.__folder,
        config: this.__config,
        jobType: this.__jobType,
        event: this.__event
    }
};
