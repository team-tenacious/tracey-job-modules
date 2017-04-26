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

    self.removeContainer(imageName, containerName, function (err, result) {

        if (err)
            return callback(err);

        self.__docker.createContainer({
                Image: imageName,
                Name: containerName,
                Cmd: cmd,
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
                callback(err);
            })
    });
};

Dockeriser.prototype.removeContainer = function (imageName, containerName, callback) {
    //var container = this.__docker.getContainer(containerName);

    var self = this;
    var container = null;

    this.__docker.listContainers(function (err, containers) {
        containers.forEach(function (containerInfo) {
            if (containerInfo.Image == imageName)
                container = self.__docker.getContainer(containerInfo.Id);
        });
    });

    if (container == null)
        return callback(null, 'No such container'); //non-error

    console.log('Removing existing container: ', container.Id);

    container.remove(function (err, result) {
        if (err)
            return callback(err);

        callback(null, result);
    });
};

Dockeriser.prototype.runContainerAndReport = function (container, callback) {

    container.start()
        .then(function (container) {
            //return container.resize({
            //    h: process.stdout.rows,
            //    w: process.stdout.columns
            //});
            callback(null, container);
        })
        //.then(function (container) {
        //    return container.stop();
        //})
        //.then(function (container) {
        //    return container.remove();
        //})
        //.then(function (data) {
        //    console.log('container removed');
        //    callback();
        //})
        .catch(function (err) {
            return callback(err);
        });
};