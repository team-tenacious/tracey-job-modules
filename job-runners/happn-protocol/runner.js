module.exports = Runner;

function Runner(job) {

    this.events = new EventEmitter();

    Object.defineProperty(this, 'job', {value: job});

    //this is to make mocking and injecting these items easier
    this.internals = {}
}

Runner.prototype.__updateState = function (state, message, context) {
    this.__emit('runner-progress', {state: state, message: message, context: context});
};

Runner.prototype.start = function (callback) {

};

Runner.prototype.__emit = function (evt, data) {
    return this.events.emit(evt, data);
};

Runner.prototype.on = function (evt, handler) {
    return this.events.on(evt, handler);
};

Runner.prototype.removeListener = function (evt, handler) {
    return this.events.removeListener(evt, handler);
};


