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
  let packets;

  beforeEach(async () => {
    packets = [];
    streamEmitter = new AsyncStreamEmitter();
  });

  afterEach(async () => {
    cancelAllPendingWaits();
    streamEmitter.killAllListeners();
  });

  it('should support listener method which can consume emitted events and which is cleaned up after closing', async () => {
    assert.equal(!!streamEmitter.emit, true);

    (async () => {
      for (let i = 0; i < 5; i++) {
        await wait(20);
        streamEmitter.emit('foo', 'hello' + i);
      }
      streamEmitter.closeListener('foo');
    })();

    for await (let event of streamEmitter.listener('foo')) {
      packets.push(event);
    }

    let expectedEvents = [
      'hello0',
      'hello1',
      'hello2',
      'hello3',
      'hello4'
    ];

    assert.equal(packets.join(','), expectedEvents.join(','));
  });

  it('should stop consuming specified events after the closeAllListeners method is invoked', async () => {
    (async () => {
      for await (let event of streamEmitter.listener('foo')) {
        packets.push(event);
      }
    })();

    (async () => {
      for await (let event of streamEmitter.listener('bar')) {
        packets.push(event);
      }
    })();

    for (let i = 0; i < 5; i++) {
      await wait(20);
      streamEmitter.emit('foo', 'hello' + i);
    }

    let fooStatsList = streamEmitter.getListenerConsumerStatsList('foo');
    let barStatsList = streamEmitter.getListenerConsumerStatsList('bar');

    assert.equal(fooStatsList.length, 1);
    assert.equal(barStatsList.length, 1);

    streamEmitter.closeAllListeners();

    await wait(0);

    fooStatsList = streamEmitter.getListenerConsumerStatsList('foo');
    barStatsList = streamEmitter.getListenerConsumerStatsList('bar');

    assert.equal(JSON.stringify(fooStatsList), '[]');
    assert.equal(JSON.stringify(barStatsList), '[]');
  });

  it('should return a consumer stats object when the getListenerConsumerStats method is called', async () => {
    let fooConsumer = streamEmitter.listener('foo').createConsumer();

    (async () => {
      for await (let event of fooConsumer) {
        packets.push(event);
      }
    })();

    (async () => {
      for await (let event of streamEmitter.listener('bar')) {
        packets.push(event);
      }
    })();

    let fooStats = streamEmitter.getListenerConsumerStats(fooConsumer.id);

    assert.notEqual(fooStats, null);
    assert.equal(fooStats.backpressure, 0);
    assert.equal(fooStats.stream, 'foo');
  });

  it('should return a list of consumer stats when the getListenerConsumerStatsList method is called', async () => {
    let fooConsumerA = streamEmitter.listener('foo').createConsumer();
    let fooConsumerB = streamEmitter.listener('foo').createConsumer();
    let barConsumer = streamEmitter.listener('bar').createConsumer();

    (async () => {
      for await (let event of fooConsumerA) {
        packets.push(event);
      }
    })();
    (async () => {
      for await (let event of fooConsumerB) {
        packets.push(event);
      }
    })();
    (async () => {
      for await (let event of barConsumer) {
        packets.push(event);
      }
    })();

    let fooStatsList = streamEmitter.getListenerConsumerStatsList('foo');
    let barStatsList = streamEmitter.getListenerConsumerStatsList('bar');

    assert.notEqual(fooStatsList, null);
    assert.equal(fooStatsList.length, 2);
    assert.equal(fooStatsList[0].stream, 'foo');
    assert.equal(fooStatsList[0].backpressure, 0);
    assert.equal(fooStatsList[1].stream, 'foo');
    assert.equal(fooStatsList[1].backpressure, 0);
    assert.notEqual(barStatsList, null);
    assert.equal(barStatsList.length, 1);
    assert.equal(barStatsList[0].backpressure, 0);
    assert.equal(barStatsList[0].stream, 'bar');
  });

  it('should return a complete list of consumer stats when the getAllListenersConsumerStatsList method is called', async () => {
    (async () => {
      for await (let event of streamEmitter.listener('foo')) {
        packets.push(event);
      }
    })();
    (async () => {
      for await (let event of streamEmitter.listener('foo')) {
        packets.push(event);
      }
    })();
    (async () => {
      for await (let event of streamEmitter.listener('bar')) {
        packets.push(event);
      }
    })();

    let allStatsList = streamEmitter.getAllListenersConsumerStatsList();

    assert.notEqual(allStatsList, null);
    assert.equal(allStatsList.length, 3);
    // Check that each ID is unique.
    assert.equal([...new Set(allStatsList.map(stats => stats.id))].length, 3);
  });

  it('should stop consuming on the specified listeners after the killListener method is called', async () => {
    let ended = [];

    (async () => {
      for await (let event of streamEmitter.listener('foo')) {
        packets.push(event);
      }
      ended.push('foo');
    })();

    (async () => {
      for await (let event of streamEmitter.listener('bar')) {
        packets.push(event);
      }
      ended.push('bar');
    })();

    for (let i = 0; i < 5; i++) {
      await wait(20);
      streamEmitter.emit('foo', 'hello' + i);
      streamEmitter.emit('bar', 'hi' + i);
    }
    streamEmitter.killListener('bar');

    await wait(0);

    let allStatsList = streamEmitter.getAllListenersConsumerStatsList();

    assert.equal(ended.length, 1);
    assert.equal(ended[0], 'bar');
    assert.equal(allStatsList.length, 1);
    assert.equal(allStatsList[0].stream, 'foo');
  });

  it('should stop consuming on all listeners after the killAllListeners method is called', async () => {
    let ended = [];

    (async () => {
      for await (let event of streamEmitter.listener('foo')) {
        packets.push(event);
      }
      ended.push('foo');
    })();

    (async () => {
      for await (let event of streamEmitter.listener('bar')) {
        packets.push(event);
      }
      ended.push('bar');
    })();

    for (let i = 0; i < 5; i++) {
      await wait(20);
      streamEmitter.emit('foo', 'hello' + i);
      streamEmitter.emit('bar', 'hi' + i);
    }
    streamEmitter.killAllListeners();

    await wait(0);

    let allStatsList = streamEmitter.getAllListenersConsumerStatsList();

    assert.equal(ended.length, 2);
    assert.equal(ended[0], 'foo');
    assert.equal(ended[1], 'bar');
    assert.equal(allStatsList.length, 0);
  });

  it('should stop consuming by a specific consumer after the killListenerConsumer method is called', async () => {
    let ended = [];

    (async () => {
      for await (let event of streamEmitter.listener('bar')) {
        packets.push(event);
      }
      ended.push('bar');
    })();

    let fooConsumer = streamEmitter.listener('foo').createConsumer();

    (async () => {
      for await (let event of fooConsumer) {
        packets.push(event);
      }
      ended.push('foo');
    })();

    streamEmitter.killListenerConsumer(fooConsumer.id);

    await wait(0);

    let allStatsList = streamEmitter.getAllListenersConsumerStatsList();

    assert.equal(ended.length, 1);
    assert.equal(ended[0], 'foo');
    assert.equal(allStatsList.length, 1);
    assert.equal(allStatsList[0].stream, 'bar');
  });

  it('should return the backpressure of the specified event when the getListenerBackpressure method is called', async () => {
    (async () => {
      for await (let event of streamEmitter.listener('foo')) {
        packets.push(event);
        await wait(300);
      }
    })();

    for (let i = 0; i < 5; i++) {
      streamEmitter.emit('foo', 'test' + i);
    }

    assert.equal(streamEmitter.getListenerBackpressure('foo'), 5);
    await wait(0);
    assert.equal(streamEmitter.getListenerBackpressure('foo'), 4);
    await wait(100);
    assert.equal(streamEmitter.getListenerBackpressure('foo'), 4);
  });

  it('should return the max backpressure of all events when the getAllListenersBackpressure method is called', async () => {
    (async () => {
      for await (let event of streamEmitter.listener('foo')) {
        packets.push(event);
        await wait(300);
      }
    })();
    (async () => {
      for await (let event of streamEmitter.listener('bar')) {
        packets.push(event);
        await wait(300);
      }
    })();

    for (let i = 0; i < 5; i++) {
      streamEmitter.emit('foo', 'test' + i);
      streamEmitter.emit('bar', 'hello' + i);
      streamEmitter.emit('bar', 'hi' + i);
    }

    assert.equal(streamEmitter.getAllListenersBackpressure(), 10);
    await wait(0);
    assert.equal(streamEmitter.getAllListenersBackpressure(), 9);
  });

  it('should return the backpressure of the specified consumer when getListenerConsumerBackpressure method is called', async () => {
    let fooConsumer = streamEmitter.listener('foo').createConsumer();
    (async () => {
      for await (let event of fooConsumer) {
        packets.push(event);
        await wait(300);
      }
    })();
    (async () => {
      for await (let event of streamEmitter.listener('bar')) {
        packets.push(event);
        await wait(300);
      }
    })();

    for (let i = 0; i < 5; i++) {
      streamEmitter.emit('foo', 'test' + i);
      streamEmitter.emit('bar', 'hello' + i);
    }

    assert.equal(streamEmitter.getListenerConsumerBackpressure(fooConsumer.id), 5);
    await wait(0);
    assert.equal(streamEmitter.getListenerConsumerBackpressure(fooConsumer.id), 4);
  });

  it('should return the correct boolean when hasListenerConsumer method is called', async () => {
    let fooConsumer = streamEmitter.listener('foo').createConsumer();
    (async () => {
      for await (let event of fooConsumer) {
        packets.push(event);
        await wait(300);
      }
    })();
    assert.equal(streamEmitter.hasListenerConsumer('foo', fooConsumer.id), true);
    assert.equal(streamEmitter.hasListenerConsumer('bar', fooConsumer.id), false);
    assert.equal(streamEmitter.hasListenerConsumer('foo', 9), false);
  });

  it('should return the correct boolean when hasAnyListenerConsumer method is called', async () => {
    let fooConsumer = streamEmitter.listener('foo').createConsumer();
    (async () => {
      for await (let event of fooConsumer) {
        packets.push(event);
        await wait(300);
      }
    })();
    assert.equal(streamEmitter.hasAnyListenerConsumer(fooConsumer.id), true);
    assert.equal(streamEmitter.hasAnyListenerConsumer(9), false);
  });

  it('should stop consuming processing a specific event after a listener is removed with the removeListener method', async () => {
    let ended = [];

    (async () => {
      for await (let event of streamEmitter.listener('bar')) {
        packets.push(event);
      }
      ended.push('bar');
    })();

    for (let i = 0; i < 5; i++) {
      streamEmitter.emit('bar', 'a' + i);
    }

    streamEmitter.removeListener('bar');
    await wait(0);
    streamEmitter.listener('bar').once();

    for (let i = 0; i < 5; i++) {
      streamEmitter.emit('bar', 'b' + i);
    }

    await wait(0);

    assert.notEqual(packets, null);
    assert.equal(packets.length, 5);
    assert.equal(packets[0], 'a0');
    assert.equal(packets[4], 'a4');
    assert.equal(ended.length, 0);
  });
});
