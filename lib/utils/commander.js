module.exports = Commander;

function Commander(){
    this.__command = require('node-cmd');
}

Commander.prototype.run = function(command, callback){

    this.__command.get(command, function (err, data, stderr) {
        //if (err)
        //    return callback(err);
        //
        //if (stderr)
        //    return callback(stderr);

        if(err)
            return callback(err);

        callback(null);
    });
};
