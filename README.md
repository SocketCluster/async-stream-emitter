# AsyncStreamEmitter
EventEmitter using AsyncIterableStream.

## Methods:

- emit
- listener
- closeListener
- closeAllListeners

## Usage examples

```js
let emitter = new AsyncStreamEmitter();

(async () => {
  await wait(10);
  emitter.emit('foo', 123, 'hello');

  // This will cause all for-await-of loops for that event to exit.
  // Note that you can also use the 'break' statement inside
  // individual for-await-of loops.
  emitter.closeListener('foo');
})();

(async () => {
  // The event data is always an array so we should use destructuring.
  for await (let [someNumber, someString] of emitter.listener('foo')) {
    // someNumber is 123
    // someString is 'hello'
  }
  console.log('The listener was closed');
})();

// Utility function.
function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}
```
