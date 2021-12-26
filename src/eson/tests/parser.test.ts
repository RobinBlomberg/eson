/* eslint-disable no-empty-character-class */
/* eslint-disable no-new-object */
/* eslint-disable no-new-wrappers */
/* eslint-disable no-sparse-arrays */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable sort-keys/sort-keys-fix */

import { deepStrictEqual, strictEqual, throws } from 'assert';
import { readFile } from 'fs';
import { join } from 'path';
import { Parser } from '../parser';

const TEST_FILES_DIR = join(process.cwd(), 'src', 'eson', 'tests', 'files');

const parser = new Parser();

/**
 * Identifier
 */

strictEqual(parser.parse('undefined'), undefined);

strictEqual(parser.parse('null'), null);

strictEqual(parser.parse('false'), false);

strictEqual(parser.parse('true'), true);

strictEqual(parser.parse('Infinity'), Infinity);

strictEqual(parser.parse('NaN'), NaN);

/**
 * NumberLiteral
 */

strictEqual(parser.parse('0'), 0);

strictEqual(parser.parse('1'), 1);

strictEqual(parser.parse('0.'), 0.0);

strictEqual(parser.parse('1.'), 1.0);

strictEqual(parser.parse('.123'), 0.123);

strictEqual(parser.parse('0.123'), 0.123);

throws(() => {
  parser.parse('05');
}, SyntaxError);

strictEqual(parser.parse('1.234'), 1.234);

throws(() => {
  parser.parse('9_');
}, SyntaxError);

strictEqual(parser.parse('9_8'), 9_8);

throws(() => {
  parser.parse('9_8_');
}, SyntaxError);

strictEqual(parser.parse('9_8_7'), 9_8_7);

throws(() => {
  parser.parse('9__');
}, SyntaxError);

strictEqual(parser.parse('6e54'), 6e54);

strictEqual(parser.parse('2E69'), 2e69);

strictEqual(parser.parse('3e-7'), 3e-7);

strictEqual(parser.parse('5.1e+51'), 5.1e51);

strictEqual(parser.parse('6e1_2'), 6e1_2);

throws(() => {
  parser.parse('6e1__');
}, SyntaxError);

strictEqual(parser.parse('6e1_2_3'), 6e1_2_3);

throws(() => {
  parser.parse('5_4_3e1_2_');
}, SyntaxError);

strictEqual(parser.parse('5_4_3e1_2_3'), 5_4_3e1_2_3);

throws(() => {
  parser.parse('0x');
}, SyntaxError);

strictEqual(parser.parse('0x0'), 0x0);

strictEqual(parser.parse('0xd'), 0xd);

strictEqual(parser.parse('0XF'), 0xf);

strictEqual(parser.parse('0x01'), 0x01);

strictEqual(parser.parse('0xfEeD'), 0xfeed);

strictEqual(parser.parse('0xDeadbeef1337'), 0xdeadbeef1337);

strictEqual(parser.parse('0xd_1'), 0xd_1);

throws(() => {
  parser.parse('0xd_.');
}, SyntaxError);

throws(() => {
  parser.parse('0x123abc.');
}, SyntaxError);

strictEqual(parser.parse('0o10'), 0o10);

strictEqual(parser.parse('0o1_0'), 0o1_0);

throws(() => {
  parser.parse('0o1_');
}, SyntaxError);

strictEqual(parser.parse('0O32'), 0o32);

strictEqual(parser.parse('0o0644'), 0o0644);

throws(() => {
  parser.parse('0o0648');
}, SyntaxError);

throws(() => {
  parser.parse('0o123.');
}, SyntaxError);

strictEqual(parser.parse('0b0'), 0b0);

strictEqual(parser.parse('0b0_1'), 0b0_1);

throws(() => {
  parser.parse('0b0_');
}, SyntaxError);

strictEqual(parser.parse('0b10100011'), 0b10100011);

strictEqual(
  parser.parse('0B01111111100000000000000000000000'),
  0b01111111100000000000000000000000,
);

throws(() => {
  parser.parse('0b012');
}, SyntaxError);

throws(() => {
  parser.parse('0b0644');
}, SyntaxError);

deepStrictEqual(parser.parse('37n'), BigInt(37));

/**
 * StringLiteral
 */

strictEqual(parser.parse('"foo"'), 'foo');

throws(() => {
  parser.parse('"foo');
}, SyntaxError);

throws(() => {
  parser.parse('"fo\\"o');
}, SyntaxError);

strictEqual(parser.parse('"fo\\"o"'), 'fo"o');

throws(() => {
  parser.parse('"fo\\');
}, SyntaxError);

throws(() => {
  parser.parse('"fo\\"');
}, SyntaxError);

strictEqual(parser.parse('"fo\\""'), 'fo"');

strictEqual(parser.parse("'foo'"), 'foo');

strictEqual(parser.parse("'fo\\'o'"), "fo'o");

strictEqual(parser.parse('"a\\0b"'), 'a\0b');

strictEqual(parser.parse('"a\\\'b"'), "a'b");

strictEqual(parser.parse('"a\\"b"'), 'a"b');

strictEqual(parser.parse('"a\\\\b"'), 'a\\b');

strictEqual(parser.parse('"a\\nb"'), 'a\nb');

strictEqual(parser.parse('"a\\rb"'), 'a\rb');

strictEqual(parser.parse('"a\\vb"'), 'a\vb');

strictEqual(parser.parse('"a\\tb"'), 'a\tb');

strictEqual(parser.parse('"a\\bb"'), 'a\bb');

strictEqual(parser.parse('"a\\fb"'), 'a\fb');

strictEqual(parser.parse('"a\\Qb"'), 'aQb');

strictEqual(parser.parse('"a\\u3bf7b"'), 'a\u3bf7b');

strictEqual(parser.parse('"a\\u{0}b"'), 'a\u{0}b');

strictEqual(parser.parse('"a\\u{1}b"'), 'a\u{1}b');

strictEqual(parser.parse('"a\\u{0000009999}b"'), 'a\u{0000009999}b');

strictEqual(parser.parse('"a\\u{1F601}b"'), 'a\u{1F601}b');

strictEqual(parser.parse('"a\\u{10FFFF}b"'), 'a\u{10FFFF}b');

throws(() => {
  parser.parse('"a\\u{110000}b"');
}, new SyntaxError('Undefined Unicode code-point'));

strictEqual(parser.parse('"a\\xfbb"'), 'a\xfbb');

strictEqual(parser.parse('"foo\\\rbar"'), 'foobar');

strictEqual(parser.parse('"foo\\\nbar"'), 'foobar');

strictEqual(parser.parse('"foo\\\r\nbar"'), 'foobar');

throws(() => {
  parser.parse('"foo\rbar"');
}, SyntaxError);

throws(() => {
  parser.parse('"foo\nbar"');
}, SyntaxError);

strictEqual(parser.parse('"foo\fbar"'), 'foo\fbar');

strictEqual(parser.parse('"${hej}"'), '${hej}');

/**
 * TemplateLiteral
 */

strictEqual(parser.parse('``'), '');

strictEqual(parser.parse('`hello \\`friend\\``'), 'hello `friend`');

strictEqual(parser.parse('`foo${42}baz`'), `foo${42}baz`);

strictEqual(
  parser.parse('`foo${`abc${-42}def`}baz`'),
  `foo${`abc${-42}def`}baz`,
);

strictEqual(parser.parse('`(${new Array()})`'), `(${[]})`);

strictEqual(parser.parse('`(${["foo", "bar"]})`'), `(${['foo', 'bar']})`);

strictEqual(
  parser.parse('`foo${3, 4}`'),
  // @ts-expect-error Test sequences
  // eslint-disable-next-line no-sequences
  `foo${(3, 4)}`,
);

strictEqual(parser.parse('`foo\nbar`'), 'foo\nbar');

strictEqual(parser.parse('`foo\rbar`'), 'foo\rbar');

strictEqual(parser.parse('`foo\r\nbar`'), 'foo\r\nbar');

strictEqual(parser.parse('`foo\r\n\n\rbar`'), 'foo\r\n\n\rbar');

strictEqual(parser.parse('`foo\\\nbar`'), 'foobar');

/**
 * ArrayExpression
 */

deepStrictEqual(parser.parse('[]'), []);

deepStrictEqual(parser.parse('[ ]'), []);

deepStrictEqual(parser.parse('[,]'), [,]);

deepStrictEqual(parser.parse('[ , ]'), [,]);

deepStrictEqual(parser.parse('[,,]'), [, ,]);

deepStrictEqual(parser.parse('[ , , ]'), [, ,]);

deepStrictEqual(parser.parse('[,3]'), [, 3]);

deepStrictEqual(parser.parse('[ , 3 ]'), [, 3]);

deepStrictEqual(parser.parse('[1,2,]'), [1, 2]);

deepStrictEqual(parser.parse('[ 1 , 2 , ]'), [1, 2]);

deepStrictEqual(parser.parse('[ 1 , "foo" , [] , {} , ]'), [1, 'foo', [], {}]);

/**
 * ObjectExpression
 */

deepStrictEqual(parser.parse('{}'), {});

throws(() => {
  parser.parse('{}', { strict: true });
}, SyntaxError);

deepStrictEqual(parser.parse('  {}'), {});

throws(() => {
  parser.parse('  {}', { strict: true });
}, SyntaxError);

throws(() => {
  parser.parse('({}');
}, SyntaxError);

throws(() => {
  parser.parse('{})');
}, SyntaxError);

deepStrictEqual(parser.parse('({})'), {});

deepStrictEqual(parser.parse('({ 0: 3 })'), { 0: 3 });

deepStrictEqual(parser.parse('( { .3 : 3 } )'), { 0.3: 3 });

deepStrictEqual(parser.parse('({ 1_2: 3 })'), { 1_2: 3 });

throws(() => {
  parser.parse('({ 0_2: 3 })');
}, SyntaxError);

deepStrictEqual(parser.parse('({foo:1})'), { foo: 1 });

deepStrictEqual(parser.parse('({ foo : 1 })'), { foo: 1 });

throws(() => {
  parser.parse('({ a: 1, 2 })');
}, SyntaxError);

deepStrictEqual(parser.parse('({hello:"test",})'), { hello: 'test' });

deepStrictEqual(parser.parse('({ hello: "test", })'), { hello: 'test' });

deepStrictEqual(parser.parse('({ "hello friend": [] })'), {
  'hello friend': [],
});

throws(() => {
  parser.parse('({ "yes" })');
}, SyntaxError);

deepStrictEqual(parser.parse('({"a":1,b:2})'), { a: 1, b: 2 });

throws(() => {
  parser.parse('({ `foo`: 3 })');
}, SyntaxError);

deepStrictEqual(parser.parse('({ [`foo`]: 3 })'), {
  foo: 3,
});

deepStrictEqual(parser.parse('({ foo: "bar" }, { ...{ a: true } })'), {
  a: true,
});

deepStrictEqual(parser.parse('"", {}'), {});

/**
 * ComputedProperty
 */

throws(() => {
  parser.parse('({ []: true })');
}, SyntaxError);

deepStrictEqual(parser.parse('({ [`a${"b"}c`]: null, })'), {
  abc: null,
});

throws(() => {
  parser.parse('({ ["foo"] }))');
}, SyntaxError);

/**
 * PropertyShorthand
 */

throws(() => {
  parser.parse('({ foo })');
}, new ReferenceError('foo is not defined'));

/**
 * SpreadElement
 */

deepStrictEqual(parser.parse('({ foo: "bar", ...{ baz: "qux" } })'), {
  foo: 'bar',
  baz: 'qux',
});

deepStrictEqual(parser.parse('({ ...[3] })'), { 0: 3 });

throws(() => {
  parser.parse('[...3]');
}, TypeError);

deepStrictEqual(parser.parse('[...[1, [2]]]'), [...[1, [2]]]);

/**
 * UnaryExpression
 */

strictEqual(parser.parse('+123'), +123);

strictEqual(parser.parse('+ 123'), +123);

strictEqual(parser.parse('-123'), -123);

strictEqual(parser.parse('- 123'), -123);

strictEqual(parser.parse('+-123'), Number(-123));

strictEqual(parser.parse('-+-123'), -Number(-123));

strictEqual(parser.parse('+-+-123'), Number(-Number(-123)));

throws(() => {
  parser.parse('--123');
}, SyntaxError);

throws(() => {
  parser.parse('++123');
}, SyntaxError);

strictEqual(parser.parse('-(-123)'), -(-123));

strictEqual(parser.parse('-(+123)'), -+123);

strictEqual(parser.parse('-(+-123)'), -Number(-123));

strictEqual(parser.parse('-+-+-(+-123)'), -Number(-Number(-Number(-123))));

strictEqual(parser.parse('-1,-2'), -2);

strictEqual(parser.parse('+1,-2'), -2);

strictEqual(parser.parse('3,(4)'), 4);

strictEqual(
  parser.parse('(-3, 4)'),
  // @ts-expect-error Test sequences
  (-3, 4),
);

strictEqual(parser.parse('-(3, 4)'), -4);

/**
 * NewExpression
 */

deepStrictEqual(
  parser.parse('new Date(1328459820000)'),
  new Date(1328459820000),
);

deepStrictEqual(
  parser.parse('new Error("Some error")'),
  new Error('Some error'),
);

deepStrictEqual(
  parser.parse('new RangeError("Inherited error")'),
  new RangeError('Inherited error'),
);

deepStrictEqual(parser.parse('new Map'), new Map());

deepStrictEqual(
  parser.parse('new Map([["foo",37],[true,null]])'),
  new Map<unknown, unknown>([
    ['foo', 37],
    [true, null],
  ]),
);

deepStrictEqual(parser.parse('new RegExp("^fo.*bar?$","g")'), /^fo.*bar?$/g);

deepStrictEqual(
  parser.parse('new Set(["foo","bar"])'),
  new Set(['foo', 'bar']),
);

deepStrictEqual(parser.parse('new Boolean(true)'), new Boolean(true));

deepStrictEqual(parser.parse('new Number(42)'), new Number(42));

deepStrictEqual(parser.parse('new String("foo")'), new String('foo'));

deepStrictEqual(parser.parse('new Array()'), []);

deepStrictEqual(parser.parse('new Array("foo")'), new Array('foo'));

deepStrictEqual(parser.parse('new Array(["foo"])'), new Array(['foo']));

deepStrictEqual(
  parser.parse('new Array(["foo", "bar"])'),
  new Array(['foo', 'bar']),
);

deepStrictEqual(parser.parse('new Array([, , "bar"])'), new Array([, , 'bar']));

deepStrictEqual(parser.parse('new Array([, , , ])'), new Array([, , ,]));

deepStrictEqual(parser.parse('new Array(3)'), new Array(3));

deepStrictEqual(parser.parse('new Object({ foo: 3 })'), new Object({ foo: 3 }));

strictEqual(
  parser.parse('new Function("...a","return ((a, b) => a + b)(...a);")')(3, 4),
  7,
);

throws(() => {
  parser.parse('new foo');
}, new ReferenceError('foo is not defined'));

throws(() => {
  parser.parse('new {}');
}, new SyntaxError("Unexpected character '{' at index 4"));

/**
 * GroupExpression
 */

throws(() => {
  parser.parse('()');
}, SyntaxError);

strictEqual(parser.parse('(null)'), null);

strictEqual(parser.parse('( null )'), null);

deepStrictEqual(parser.parse('([true, (false), ((({})))])'), [true, false, {}]);

/**
 * SequenceExpression
 */

strictEqual(parser.parse('"foo", "bar", "baz"'), 'baz');

strictEqual(parser.parse('(1, 2, 3)'), 3);

strictEqual(parser.parse('3, 4'), 4);

throws(() => {
  parser.parse('3,');
}, new SyntaxError('Unexpected end of input'));

throws(() => {
  parser.parse(',3');
}, SyntaxError);

/**
 * RegExpLiteral
 */

deepStrictEqual(parser.parse('/foo.*bar/'), /foo.*bar/);

throws(() => {
  parser.parse('/foo');
}, SyntaxError);

deepStrictEqual(parser.parse('/foo\\/bar/'), /foo\/bar/);

throws(() => {
  parser.parse('/foo/bar/');
}, SyntaxError);

deepStrictEqual(parser.parse('/foo[/]bar/'), /foo[/]bar/);

throws(() => {
  parser.parse('/foo[bar/');
}, SyntaxError);

deepStrictEqual(parser.parse('/foo[0-9/a-z/]bar/'), /foo[0-9/a-z/]bar/);

deepStrictEqual(parser.parse('/foo0-9]/'), /foo0-9]/);

deepStrictEqual(parser.parse('/foo[\\]]bar/'), /foo[\]]bar/);

deepStrictEqual(parser.parse('/foo[0-9\\]a-z[]bar/'), /foo[0-9\]a-z[]bar/);

deepStrictEqual(parser.parse('/foo[[]/'), /foo[[]/);

deepStrictEqual(parser.parse('/foo[]]/'), /foo[]]/);

deepStrictEqual(parser.parse('/foo[]][^]]/'), /foo[]][^]]/);

deepStrictEqual(parser.parse('/^.*foo[^\\]]$/'), /^.*foo[^\]]$/);

deepStrictEqual(parser.parse('/g/g'), /g/g);

deepStrictEqual(parser.parse('/^.*foo[^\\]]$/gimsuy'), /^.*foo[^\]]$/gimsuy);

throws(() => {
  parser.parse('/^.*foo[^]]$/gimsuyd');
}, SyntaxError);

/**
 * (inline comment)
 */

strictEqual(parser.parse('//'), undefined);

strictEqual(parser.parse('// '), undefined);

strictEqual(parser.parse('//\n'), undefined);

deepStrictEqual(
  parser.parse(`[//test
    //test
    'foo',//test
    //test
    42,//test
    //test
  ]`),
  ['foo', 42],
);

deepStrictEqual(
  parser.parse(`
    new//test
    //test
    Array()//test
  `),
  [],
);

strictEqual(
  parser.parse(`
    'foo',//test
    //test
    'bar'//test
  `),
  'bar',
);

strictEqual(
  parser.parse(`
    +//test
    34,//test
    -//test
    5e6//test
  `),
  -5e6,
);

deepStrictEqual(
  parser.parse(`({//test
    //test
    foo//test
    ://test
    'bar'//test
    ,//test
    a: 3,//test
  })//test`),
  {
    foo: 'bar',
    a: 3,
  },
);

throws(() => {
  parser.parse(`({
    // Do something.})
  `);
}, SyntaxError);

/**
 * (block comment)
 */

throws(() => {
  parser.parse('/*');
}, SyntaxError);

throws(() => {
  parser.parse('/**');
}, SyntaxError);

strictEqual(parser.parse('/**/'), undefined);

strictEqual(parser.parse(' /*  */ '), undefined);

strictEqual(parser.parse('/* Hello world! */'), undefined);

strictEqual(parser.parse('/**/1/*/**/, /** //*/2/**/'), 2);

deepStrictEqual(
  parser.parse(`[/*
    */'foo',/*
    */42,/*
  */]`),
  ['foo', 42],
);

deepStrictEqual(
  parser.parse(`/*
    */new/*
    */Array()/*
  */`),
  [],
);

strictEqual(
  parser.parse(`/*
    */'foo',/*
    *///test
    /*
    */'bar'/*
  */`),
  'bar',
);

strictEqual(
  parser.parse(`/*
    */+/*
    */34,/*/
    */-/*
    */5e6/*
  */`),
  -5e6,
);

deepStrictEqual(
  parser.parse(`({/*
    */foo/*
    */:/*
    */'bar'/*
    */,/*
    */a: 3,/*
  */})/**/`),
  {
    foo: 'bar',
    a: 3,
  },
);

/**
 * (files)
 */

readFile(join(TEST_FILES_DIR, 'data.js'), 'utf8', (error, data) => {
  if (error) {
    throw error;
  }

  deepStrictEqual(parser.parse(data), {
    inf: Infinity,
    und: undefined,
    date: new Date('2021-04-14'),
    map: new Map([['foo', 'bar']]),
    set: new Set([Infinity, 'yes']),
    reg: new RegExp('^foo$', 'g'),
  });
});
