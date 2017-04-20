module.exports = Dockeriser;


function Dockeriser() {
    var Dockerode = require('dockerode');
    this.__docker = new Dockerode({socketPath: '/var/run/docker.sock'});
}

Dockeriser.prototype.buildImage = function (dockerFileContext, files, imageName, callback) {
    var self = this;

    self.__docker.buildImage({
            context: dockerFileContext,
            src: files
        }, {t: imageName}
        )
        .then(function (stream) {
            stream.pipe(process.stdout, {end: true});

            stream.on('end', function () {
                callback();
            });
        })
        .catch(function (err) {
            console.log(':: IMAGE BUILD ERROR: ', err);
            return callback(err);
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
        })
        .then(function (container) {
            callback(null, container);
        })
        .catch(function (err) {
            return callback(err);
        });
};

Dockeriser.prototype.runContainerAndReport = function (container, callback) {
    container.start()
        .then(function (container) {
            return container.resize({
                h: process.stdout.rows,
                w: process.stdout.columns
            });
        })
        .then(function (container) {
            return container.stop();
        })
        .then(function (container) {
            return container.remove();
        })
        .then(function (data) {
            console.log('container removed');
        })
        .catch(function (err) {
            console.log(err);
        });
};