const StreamDemux = require('stream-demux');

function AsyncStreamEmitter() {
  this._listenerDemux = new StreamDemux();
}

AsyncStreamEmitter.prototype.listener = function (eventName) {
  return this._listenerDemux.stream(eventName);
};

AsyncStreamEmitter.prototype.closeListener = function (eventName) {
  this._listenerDemux.close(eventName);
};

AsyncStreamEmitter.prototype.emit = function (eventName, data) {
  this._listenerDemux.write(eventName, data);
};

module.exports = AsyncStreamEmitter;
