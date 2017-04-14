module.exports = JobParser;

function JobParser() {
}

/*
 The point of having a parser is because the incoming job has a *potentially* unknown structure. We
 want to parse it and build a job object that is known to us.
 */

JobParser.prototype.parseJob = function (job) {

    var JobBuilder = require('../builders/job-builder');
    var jobBuilder = new JobBuilder();

    return jobBuilder.withRepo(this.__findValue(job, 'repo'))
        .withFolder(this.__findValue(job, 'folder'))
        .withConfig(this.__findValue(job, 'config'))
        .withJobType(this.__findValue(job, 'jobType'))
        .withEvent(this.__findValue(job, 'event'))
        .build();
};


JobParser.prototype.__findValue = function (job, name) {
    var self = this;

    for (var key in job) {
        if (job.hasOwnProperty(key) && (key.toLowerCase() == name.toLowerCase()))
            return job[key];
        else
            self.__findValue(job[key], name)
    }

    return null;
};
