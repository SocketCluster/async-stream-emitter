const assert = require('assert');
const AsyncStreamEmitter = require('../index');

let pendingTimeoutSet = new Set();

function wait(duration) {
  return new Promise((resolve) => {
    let timeout = setTimeout(() => {
      pendingTimeoutSet.clear(timeout);
      resolve();
    }, duration);
    pendingTimeoutSet.add(timeout);
  });
}

function cancelAllPendingWaits() {
  for (let timeout of pendingTimeoutSet) {
    clearTimeout(timeout);
  }
}

describe('AsyncStreamEmitter', () => {
  let streamEmitter;

  beforeEach(async () => {
    streamEmitter = new AsyncStreamEmitter();
  });

  afterEach(async () => {
    cancelAllPendingWaits();
  });

  it('should expose an emit method', async () => {
    assert.equal(!!streamEmitter.emit, true);
  });

  it('should expose a listener method', async () => {
    assert.equal(!!streamEmitter.listener, true);
  });

  it('should expose a closeListener method', async () => {
    assert.equal(!!streamEmitter.closeListener, true);
  });

  it('should expose a closeAllListeners method', async () => {
    assert.equal(!!streamEmitter.closeAllListeners, true);
  });

  it('should expose a getConsumerStats method', async () => {
    assert.equal(!!streamEmitter.getConsumerStats, true);
  });

  it('should expose a getConsumerStatsList method', async () => {
    assert.equal(!!streamEmitter.getConsumerStatsList, true);
  });

  it('should expose a getConsumerStatsListAll method', async () => {
    assert.equal(!!streamEmitter.getConsumerStatsListAll, true);
  });

  it('should expose a killListener method', async () => {
    assert.equal(!!streamEmitter.killListener, true);
  });

  it('should expose a killAllListeners method', async () => {
    assert.equal(!!streamEmitter.killAllListeners, true);
  });

  it('should expose a killConsumer method', async () => {
    assert.equal(!!streamEmitter.killConsumer, true);
  });

  it('should expose a getBackpressure method', async () => {
    assert.equal(!!streamEmitter.getBackpressure, true);
  });

  it('should expose a getBackpressureAll method', async () => {
    assert.equal(!!streamEmitter.getBackpressureAll, true);
  });

  it('should expose a getConsumerBackpressure method', async () => {
    assert.equal(!!streamEmitter.getConsumerBackpressure, true);
  });

  it('should expose a hasConsumer method', async () => {
    assert.equal(!!streamEmitter.hasConsumer, true);
  });

  it('should expose a hasConsumerAll method', async () => {
    assert.equal(!!streamEmitter.hasConsumerAll, true);
  });
});
