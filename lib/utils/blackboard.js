module.exports = Blackboard;

var figures = require('figures');
var chalk = require('chalk');

function Blackboard() {
}

Blackboard.prototype.chalkRed = function (text) {
    console.log('\n   ' + chalk.red(text));
};