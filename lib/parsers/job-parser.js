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
        .build();
};


JobParser.prototype.__findValue = function (job, name) {
    var self = this;

    for (var key in job) {
        if (job.hasOwnProperty(key) && key == name) {
            return job[key];
        } else {
            if (typeof job[key] == Object)
                self.__findValue(job[key], name);
        }
    }

    return null;
};
