module.exports = IpfsUtil;

var fs = require('fs');
var formstream = require('formstream');
var http = require('http');
var request = require('request');

function IpfsUtil() {
}

IpfsUtil.prototype.init = function (config) {
    this.__host = config.ipfs.host;
    this.__port = config.ipfs.port;
};

IpfsUtil.prototype.getTar = function (key, toFile, callback) {

    var self = this;
    var uri = 'http://' + self.__host + ':' + self.__port + '/api/v0/tar/cat?arg=' + key;

    console.log(uri);

    request
        .get(uri)
        .on('end', function () {
            console.log('GET request ended....');
            callback();
        }).on('error', function (err) {
            console.log('ERROR: ', err);
            return callback(err);
        })
        .pipe(fs.createWriteStream(toFile));
};

IpfsUtil.prototype.uploadTar = function (filePath, callback) {

    var self = this;

    var form = formstream();
    form.file('file', filePath);

    var options = {
        method: 'POST',
        host: self.__host,
        port: self.__port,
        path: '/api/v0/tar/add',
        headers: form.headers()
    };

    console.log(options);

    var req = http.request(options, function (res) {

        res.on('data', function (data) {
            console.log(data);
            callback(null, (JSON.parse(data)).Hash);
        });

        //res.on('end', function () {
        //    console.log('Request ended...');
        //    callback();
        //});

        res.on('error', function (err) {
            console.log(err);
            return callback(err);
        })
    });

    form.pipe(req);
};