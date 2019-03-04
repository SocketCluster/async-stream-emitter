# async-stream-emitter
EventEmitter using ConsumableStream.

## Main methods:

- emit(eventName, data)
- listener(eventName)
- closeListener(eventName)
- closeAllListeners()
- killListener(eventName)
- killAllListeners()
- getListenerBackpressure(eventName)
- getAllListenersBackpressure()

## Usage examples

```js
let emitter = new AsyncStreamEmitter();

(async () => {
  await wait(10);
  emitter.emit('foo', 'hello');

  // This will cause all for-await-of loops for that event to exit.
  // Note that you can also use the 'break' statement inside
  // individual for-await-of loops.
  emitter.closeListener('foo');
})();

(async () => {
  for await (let data of emitter.listener('foo')) {
    // data is 'hello'
  }
  console.log('The listener was closed.');
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

Note that unlike with `EventEmitter`, you cannot get the count for the number of active listeners at any given time.
This is intentional as it encourages code to be written in a more declarative style and lowers the risk of memory leaks.

If you want to track listeners, you should do it yourself.
The new ECMAScript `Symbol` type should make tracking object references easier: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol
