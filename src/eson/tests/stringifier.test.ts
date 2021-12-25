/* eslint-disable no-sparse-arrays */
/* eslint-disable no-new-wrappers */
import { strictEqual } from 'assert';
import { stringify } from '../stringifier';

strictEqual(stringify(undefined), 'undefined');

strictEqual(stringify(null), 'null');

strictEqual(stringify(false), 'false');

strictEqual(stringify(true), 'true');

strictEqual(stringify(Infinity), 'Infinity');

strictEqual(stringify(NaN), 'NaN');

strictEqual(stringify(0.123), '0.123');

strictEqual(stringify(3.5e73), '3.5e+73');

strictEqual(stringify("fo'o"), "'fo\\'o'");

strictEqual(stringify([null, true, 35, []]), '[null,true,35,[]]');

strictEqual(
  stringify({ foo: ['bar'], "some 'key'": {} }),
  "({foo:['bar'],'some \\'key\\'':{}})",
);

strictEqual(stringify(BigInt(37)), '37n');

strictEqual(stringify(new Date(1328459820000)), 'new Date(1328459820000)');

strictEqual(stringify(new Error('Some error')), "new Error('Some error')");

strictEqual(
  stringify(new RangeError('Inherited error')),
  "new RangeError('Inherited error')",
);

strictEqual(
  stringify(
    new Map<unknown, unknown>([
      ['foo', 37],
      [true, null],
    ]),
  ),
  "new Map([['foo',37],[true,null]])",
);

strictEqual(stringify(/^fo.*bar?$/g), "new RegExp('^fo.*bar?$','g')");

strictEqual(stringify(new Set(['foo', 'bar'])), "new Set(['foo','bar'])");

strictEqual(stringify(new Boolean(true)), 'new Boolean(true)');

strictEqual(stringify(new Number(42)), 'new Number(42)');

strictEqual(stringify(new String('foo')), "new String('foo')");

strictEqual(stringify([]), '[]');

strictEqual(stringify(new Array('foo')), "['foo']");

strictEqual(stringify(new Array(['foo'])), "[['foo']]");

strictEqual(stringify(new Array(['foo', 'bar'])), "[['foo','bar']]");

strictEqual(stringify(new Array([, , 'bar'])), "[[,,'bar']]");

strictEqual(stringify(new Array([, ,])), '[new Array(2)]');

strictEqual(stringify(new Array(3)), 'new Array(3)');
