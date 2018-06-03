# Niños

> Simple stubbing/spying for [AVA](https://ava.li)

## Example

**Setup**

```js
const test = require('ava');
const n = require('ninos')(test);
```

**n.stub()**

```js
const EventEmitter = require('events');

test('EventEmitter', t => {
  let e = new EventEmitter();
  let s = n.stub();
  e.on('event', s);

  e.emit('event');
  t.is(s.calls.length, 1);

  e.emit('event', 'arg');
  t.is(s.calls[1].arguments[0], 'arg');
});
```

**n.spy()**

```js
const api = require('./api');

test('api.getCurrentUser()', t => {
  let s = n.spy(api, 'request', () => {
    return Promise.resolve({ id: 42 });
  });

  await api.getCurrentUser();

  t.deepEqual(s.calls[0].arguments[0], {
    method: 'GET',
    url: '/api/v1/user',
  });
});
```

## Install

```sh
yarn add --dev ninos
```

## Usage

#### `ninos()`

This method setups the `n.stub()` and `n.spy()` functions. It hooks into AVA to
automatically restore spies after each test.

```js
const test = require('ava');
const ninos = require('ninos');

const n = ninos(test);

console.log(n); // { stub: [Function], spy: [Function] }
```

#### `n.stub()`

Call this method to create a function that you can use in place of any other
function (as a callback/etc).

```js
test('example', t => {
  let s = n.stub(); // [Function]
});
```

On that function is a `calls` property which is an array of all the calls you
made.

```js
let s = n.stub();

s.call('this', 'arg1', 'arg2');

t.deepEqual(s.calls, [
  { this: 'this', arguments: ['arg1', 'arg2'], return: undefined },
]);
```

You can optional pass an inner function to be called inside the stub to
customize its behavior.

```js
let s = n.stub((...args) => {
  return 'hello!';
});

s();

t.deepEqual(s.calls, [
  { ..., return: 'hello!' },
]);
```

If you want to customize the behavior based on the current call you can use
`s.calls`.

```js
let s = n.stub((...args) => {
  if (s.calls.length === 0) return 'one';
  if (s.calls.length === 1) return 'two';
  if (s.calls.length === 2) return 'three';
  throw new Error('too many calls!');
});

t.is(s(), 'one');
t.is(s(), 'two');
t.is(s(), 'three');
t.throws(() => s()); // Error: too many calls!
```

#### `n.spy()`

If you need to write tests against a method on an object, you should use a spy
instead of a stub.

```js
let method = () => 'hello from method';
let object = { method };

let s = n.spy(object, 'method');
```

Just like stubs, spies have a `calls` property.

```js
let s = n.spy(object, 'method');

object.method.call('this', 'arg1', 'arg2');

t.deepEqual(s.calls, [
  { this: 'this', arguments: ['arg1', 'arg2'], return: 'hello from method'; },
]);
```

By default, spies will call the original function. If you want to customize the
behavior you can pass your own inner function.

```js
let s = n.spy(object, 'method', (...args) => {
  return 'hello from spy'
});

object.method();

t.deepEqual(s.calls, [
  { ..., return: 'hello from spy' },
]);
```

If you still want access to the original function you can find it on
`s.original`.

```js
let s = n.spy(object, 'method', (...args) => {
  return s.original(...args) + ' and hello from spy';
});

object.method();

t.deepEqual(s.calls, [
  { ..., return: 'hello from method and hello from spy' },
]);
```

Spies will automatically be restored at the end of your test, but if you want
to do it yourself:

```js
let s = n.spy(object, 'method');
object.method = s.original;
```

## API

Here is the basic API interface (simplified from `index.js.flow`):

```ts
type Call =
  | { this: any, arguments: Array<any>, return: any }
  | { this: any, arguments: Array<any>, throw: any }; // when an error was thrown

type Stub = Function & { calls: Array<Call> };
type Spy = Function & { calls: Array<Call>, original: Function };

declare function ninos(test: AvaTest): {
  stub(inner?: Function): Stub;
  spy(object: Object, method: string, inner?: Function): Spy;
}
```

## Design

Niños tries to keep things as miminal as possible. So it avoids APIs like:

```js
let s = t.stub();

s.onCall(0).returns('ret1');
s.onCall(1).returns('ret2');
```

And:

```js
t.toHaveBeenCalledWith(s, 'arg1', 'arg2');
```

Instead you should write tests like this:

```js
test('example', t => {
  let s = n.stub(() => {
    if (s.calls.length === 0) return 'ret1';
    if (s.calls.length === 1) return 'ret2';
  });

  t.deepEqual(s.calls[0], ['arg1', 'arg2']);
});
```

This is ultimately more flexible and doesn't end up with dozens of weird
one-off APIs for you to memorize.

If you prefer the former, Sinon is the library for you.

---

> **Note:** This is part of a [proposal to add stubs/spies to AVA itself](https://github.com/avajs/ava/issues/1825)
