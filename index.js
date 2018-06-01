'use strict';

function ninos(test) {
  let spys = [];

  test.afterEach(() => {
    spys.forEach(({ object, method, original }) => {
      object[method] = original;
    });
    spys = [];
  });

  function stub(inner) {
    let calls = [];

    inner = inner || (() => {});

    function stub(...args) {
      try {
        calls.push({
          this: this,
          arguments: args,
          return: inner.call(this, ...args),
        });
      } catch (err) {
        calls.push({
          this: this,
          arguments: args,
          error: err,
        });
        throw err;
      }
    }

    stub.calls = calls;

    return stub;
  }

  function spy(object, method, inner) {
    let calls = [];
    let original = object[method];

    inner = inner || original;

    function spy(...args) {
      try {
        calls.push({
          this: this,
          arguments: args,
          return: inner.call(this, ...args),
        });
      } catch (err) {
        calls.push({
          this: this,
          arguments: args,
          error: err,
        });
        throw err;
      }
    }

    spy.calls = calls;
    spy.original = original;

    object[method] = spy;
    spys.push({ object, method, original });

    return spy;
  }

  return { stub, spy };
}

module.exports = ninos;
