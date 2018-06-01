// @flow
'use strict';
const test = require('ava');
const ninos = require('./');
const EventEmitter = require('events');

const n = ninos(test);

test('n.stub()', t => {
  let s = n.stub((...args) => {
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
});

function method(arg) {
  return 'r2';
}

let object = { method };

test('n.spy()', t => {
  let s = n.spy(object, 'method', (...args) => {
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

test('t.spy() restored after test', t => {
  t.is(object.method, method);
});
