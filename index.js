const StreamDemux = require('stream-demux');

function StreamEmitter() {
  this._listenerDemux = new StreamDemux();
}

StreamEmitter.prototype.listener = function (eventName) {
  return this._listenerDemux.stream(eventName);
};

StreamEmitter.prototype.closeListener = function (eventName) {
  this._listenerDemux.close(eventName);
};

StreamEmitter.prototype.emit = function (eventName, data) {
  this._listenerDemux.write(eventName, data);
};

module.exports = StreamEmitter;
