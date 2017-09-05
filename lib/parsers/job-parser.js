module.exports = JobParser;

function JobParser() {
}

/*
 The point of having a parser is because the incoming job has a *potentially* unknown structure. We
 want to parse it and build a job object that is known to us.
 */

JobParser.prototype.parseJob = function (job) {

    var self = this;

    var JobBuilder = require('../builders/job-builder');
    var jobBuilder = new JobBuilder();

    return jobBuilder
        .withRepo(self.__findValue(job, 'repo'))
        .withFolder(self.__findValue(job, 'folder'))
        .withConfig(self.__findValue(job, 'config'))
        .withJobType(self.__findValue(job, 'jobType'))
        .withEvent(self.__findValue(job, 'event'))
        .withGithubConfig(self.__findValue(job, 'github'))
        .build();
};


JobParser.prototype.__findValue = function (job, name) {

    var result = null;

    var recurse = function (currentJob, currentName) {

        var propertyNames = Object.getOwnPropertyNames(currentJob);

        propertyNames.forEach(function (propName) {
            if (propName == currentName)
                result = currentJob[propName];
            else {
                if (typeof currentJob[propName] == 'object')
                    recurse(currentJob[propName], currentName);
            }
        });
    };

    recurse(job, name);

    return result;
};
