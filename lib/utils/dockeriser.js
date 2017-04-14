module.exports = Dockeriser;


function Dockeriser() {
    var Dockerode = require('dockerode');
    this.__docker = new Dockerode();
}

Dockeriser.prototype.buildImage = function (dockerFileContext, dockerFile, imageName, callback) {
    var self = this;

    self.__docker.buildImage({
        context: dockerFileContext,
        src: [dockerFile]
    }, {t: imageName}, function (err, response) {
        return callback(err, response);
    });
};

Dockeriser.prototype.createContainer = function (imageName, cmd, containerName, callback) {
    var self = this;

    self.__docker.createContainer({
        Image: imageName,
        name: containerName,
        Cmd: [cmd],
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        OpenStdin: false,
        StdinOnce: false
    }, callback);
};

Dockeriser.prototype.runContainerAndReport = function (container, callback) {
    container.start()
        .then(function (container) {
            return container.resize({
                h: process.stdout.rows,
                w: process.stdout.columns
            });
        }).then(function (container) {
        return container.stop();
    }).then(function (container) {
        return container.remove();
    }).then(function (data) {
        console.log('container removed');
    }).catch(function (err) {
        console.log(err);
    });
};