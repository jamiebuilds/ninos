// @flow
'use strict';
const test = require('./')(require('ava'));
const EventEmitter = require('events');

function method(arg) {
  return 'r2';
}

let object = { method };

test('t.context.stub()', t => {
  let s = t.context.stub((...args) => {
    if (s.calls.length === 0) { t.deepEqual(args, ['a1']); return 'r1'; }
    if (s.calls.length === 1) { t.deepEqual(args, ['a2']); return 'r2'; }
    if (s.calls.length === 2) { t.deepEqual(args, ['a3']); return 'r3'; }
    throw new Error('too many calls');
  });

  s.call('t1', 'a1');
  s.call('t2', 'a2');
  s.call('t3', 'a3');

  t.deepEqual(s.calls, [
    { this: 't1', arguments: ['a1'], return: 'r1' },
    { this: 't2', arguments: ['a2'], return: 'r2' },
    { this: 't3', arguments: ['a3'], return: 'r3' },
  ]);

  t.throws(() => {
    s.call('t4', 'a4');
  });

  t.is(s.calls[3].return, undefined);
  t.true(s.calls[3].throw instanceof Error);
});

test('t.context.spy()', t => {
  let s = t.context.spy(object, 'method', (...args) => {
    if (s.calls.length === 0) { t.deepEqual(args, ['a1']); return 'r1'; }
    if (s.calls.length === 1) { t.deepEqual(args, ['a2']); return s.original(...args); }
    if (s.calls.length === 2) { t.deepEqual(args, ['a3']); return 'r3'; }
    return s.original(...args);
  });

  t.is(s.original, method);

  object.method.call('t1', 'a1');
  s.call('t2', 'a2');
  object.method.call('t3', 'a3');

  t.deepEqual(s.calls, [
    { this: 't1', arguments: ['a1'], return: 'r1' },
    { this: 't2', arguments: ['a2'], return: 'r2' },
    { this: 't3', arguments: ['a3'], return: 'r3' },
  ]);
});

test('t.context.spy() restored after test', t => {
  t.is(object.method, method);
});
