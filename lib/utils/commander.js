var command = require('node-cmd')

module.exports = Commander;

function Commander(){}

Commander.prototype.run = function(command, callback){

    command.get(command, function (err, data, stderr) {
        if (err)
            return callback(err);

        callback(null, data);
    });
};
