module.exports = RunnerFactory;

function RunnerFactory() {
}

RunnerFactory.prototype.getRunnerModule = function (runnerType) {
    throw new Error('getRunnerModule not yet implemented!');
};