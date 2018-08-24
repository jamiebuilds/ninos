'use strict';

function ninos(test) {
  const spies = Symbol('spies');

  test.beforeEach(t => {
    t.context[spies] = [];

    t.context.stub = inner => {
      let calls = [];

      inner = inner || (() => {});

      function stub(...args) {
        try {
          const val = inner.call(this, ...args);
          calls.push({
            this: this,
            arguments: args,
            return: val,
          });
          return val;
        } catch (err) {
          calls.push({
            this: this,
            arguments: args,
            throw: err,
          });
          throw err;
        }
      }

      stub.calls = calls;

      return stub;
    };

    t.context.spy = (object, method, inner) => {
      let calls = [];
      let original = object[method];

      inner = inner || original;

      function spy(...args) {
        try {
          const val = inner.call(this, ...args);
          calls.push({
            this: this,
            arguments: args,
            return: val,
          });
          return val;
        } catch (err) {
          calls.push({
            this: this,
            arguments: args,
            throw: err,
          });
          throw err;
        }
      }

      spy.calls = calls;
      spy.original = original;

      object[method] = spy;
      t.context[spies].push({ object, method, original });

      return spy;
    };
  });

  test.afterEach(t => {
    t.context[spies].forEach(({ object, method, original }) => {
      object[method] = original;
    });
  });

  return test;
}

module.exports = ninos;
