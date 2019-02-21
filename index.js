const StreamDemux = require('stream-demux');

function AsyncStreamEmitter() {
  this._listenerDemux = new StreamDemux();
}

AsyncStreamEmitter.prototype.emit = function (eventName, data) {
  this._listenerDemux.write(eventName, data);
};

AsyncStreamEmitter.prototype.listener = function (eventName) {
  return this._listenerDemux.stream(eventName);
};

AsyncStreamEmitter.prototype.closeListener = function (eventName) {
  this._listenerDemux.close(eventName);
};

AsyncStreamEmitter.prototype.closeAllListeners = function () {
  this._listenerDemux.closeAll();
};

AsyncStreamEmitter.prototype.getConsumerStats = function (consumerId) {
  return this._listenerDemux.getConsumerStats(consumerId);
};

AsyncStreamEmitter.prototype.getConsumerStatsList = function (eventName) {
  return this._listenerDemux.getConsumerStatsList(eventName);
};

AsyncStreamEmitter.prototype.getConsumerStatsListAll = function () {
  return this._listenerDemux.getConsumerStatsListAll();
};

AsyncStreamEmitter.prototype.killListener = function (eventName) {
  this._listenerDemux.kill(eventName);
};

AsyncStreamEmitter.prototype.killAllListeners = function () {
  this._listenerDemux.killAll();
};

AsyncStreamEmitter.prototype.killConsumer = function (consumerId) {
  this._listenerDemux.killConsumer(consumerId);
};

AsyncStreamEmitter.prototype.getBackpressure = function (eventName) {
  return this._listenerDemux.getBackpressure(eventName);
};

AsyncStreamEmitter.prototype.getBackpressureAll = function () {
  return this._listenerDemux.getBackpressureAll();
};

AsyncStreamEmitter.prototype.getConsumerBackpressure = function (consumerId) {
  return this._listenerDemux.getConsumerBackpressure(consumerId);
};

AsyncStreamEmitter.prototype.hasConsumer = function (eventName, consumerId) {
  return this._listenerDemux.hasConsumer(eventName, consumerId);
};

AsyncStreamEmitter.prototype.hasConsumerAll = function (consumerId) {
  return this._listenerDemux.hasConsumerAll(consumerId);
};

module.exports = AsyncStreamEmitter;
