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
});
