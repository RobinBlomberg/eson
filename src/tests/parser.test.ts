/* eslint-disable no-empty-character-class */
/* eslint-disable no-new-object */
/* eslint-disable no-new-wrappers */
/* eslint-disable no-sparse-arrays */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable sort-keys/sort-keys-fix */

import { deepStrictEqual, strictEqual, throws } from 'assert';
import { readFile } from 'fs';
import { join } from 'path';
import { parse } from '../parser';

const TEST_FILES_DIR = join(process.cwd(), 'src', 'tests', 'files');

/**
 * Identifier
 */

strictEqual(parse('undefined'), undefined);

strictEqual(parse('null'), null);

strictEqual(parse('false'), false);

strictEqual(parse('true'), true);

strictEqual(parse('Infinity'), Infinity);

strictEqual(parse('NaN'), NaN);

/**
 * NumberLiteral
 */

strictEqual(parse('0'), 0);

strictEqual(parse('1'), 1);

strictEqual(parse('0.'), 0.0);

strictEqual(parse('1.'), 1.0);

strictEqual(parse('.123'), 0.123);

strictEqual(parse('0.123'), 0.123);

throws(() => {
  parse('05');
}, SyntaxError);

strictEqual(parse('1.234'), 1.234);

throws(() => {
  parse('9_');
}, SyntaxError);

strictEqual(parse('9_8'), 9_8);

throws(() => {
  parse('9_8_');
}, SyntaxError);

strictEqual(parse('9_8_7'), 9_8_7);

throws(() => {
  parse('9__');
}, SyntaxError);

strictEqual(parse('6e54'), 6e54);

strictEqual(parse('2E69'), 2e69);

strictEqual(parse('3e-7'), 3e-7);

strictEqual(parse('5.1e+51'), 5.1e51);

strictEqual(parse('6e1_2'), 6e1_2);

throws(() => {
  parse('6e1__');
}, SyntaxError);

strictEqual(parse('6e1_2_3'), 6e1_2_3);

throws(() => {
  parse('5_4_3e1_2_');
}, SyntaxError);

strictEqual(parse('5_4_3e1_2_3'), 5_4_3e1_2_3);

throws(() => {
  parse('0x');
}, SyntaxError);

strictEqual(parse('0x0'), 0x0);

strictEqual(parse('0xd'), 0xd);

strictEqual(parse('0XF'), 0xf);

strictEqual(parse('0x01'), 0x01);

strictEqual(parse('0xfEeD'), 0xfeed);

strictEqual(parse('0xDeadbeef1337'), 0xdeadbeef1337);

strictEqual(parse('0xd_1'), 0xd_1);

throws(() => {
  parse('0xd_.');
}, SyntaxError);

throws(() => {
  parse('0x123abc.');
}, SyntaxError);

strictEqual(parse('0o10'), 0o10);

strictEqual(parse('0o1_0'), 0o1_0);

throws(() => {
  parse('0o1_');
}, SyntaxError);

strictEqual(parse('0O32'), 0o32);

strictEqual(parse('0o0644'), 0o0644);

throws(() => {
  parse('0o0648');
}, SyntaxError);

throws(() => {
  parse('0o123.');
}, SyntaxError);

strictEqual(parse('0b0'), 0b0);

strictEqual(parse('0b0_1'), 0b0_1);

throws(() => {
  parse('0b0_');
}, SyntaxError);

strictEqual(parse('0b10100011'), 0b10100011);

strictEqual(
  parse('0B01111111100000000000000000000000'),
  0b01111111100000000000000000000000,
);

throws(() => {
  parse('0b012');
}, SyntaxError);

throws(() => {
  parse('0b0644');
}, SyntaxError);

deepStrictEqual(parse('37n'), BigInt(37));

/**
 * StringLiteral
 */

strictEqual(parse('"foo"'), 'foo');

throws(() => {
  parse('"foo');
}, SyntaxError);

throws(() => {
  parse('"fo\\"o');
}, SyntaxError);

strictEqual(parse('"fo\\"o"'), 'fo"o');

throws(() => {
  parse('"fo\\');
}, SyntaxError);

throws(() => {
  parse('"fo\\"');
}, SyntaxError);

strictEqual(parse('"fo\\""'), 'fo"');

strictEqual(parse("'foo'"), 'foo');

strictEqual(parse("'fo\\'o'"), "fo'o");

strictEqual(parse('"a\\0b"'), 'a\0b');

strictEqual(parse('"a\\\'b"'), "a'b");

strictEqual(parse('"a\\"b"'), 'a"b');

strictEqual(parse('"a\\\\b"'), 'a\\b');

strictEqual(parse('"a\\nb"'), 'a\nb');

strictEqual(parse('"a\\rb"'), 'a\rb');

strictEqual(parse('"a\\vb"'), 'a\vb');

strictEqual(parse('"a\\tb"'), 'a\tb');

strictEqual(parse('"a\\bb"'), 'a\bb');

strictEqual(parse('"a\\fb"'), 'a\fb');

strictEqual(parse('"a\\Qb"'), 'aQb');

strictEqual(parse('"a\\u3bf7b"'), 'a\u3bf7b');

strictEqual(parse('"a\\u{0}b"'), 'a\u{0}b');

strictEqual(parse('"a\\u{1}b"'), 'a\u{1}b');

strictEqual(parse('"a\\u{0000009999}b"'), 'a\u{0000009999}b');

strictEqual(parse('"a\\u{1F601}b"'), 'a\u{1F601}b');

strictEqual(parse('"a\\u{10FFFF}b"'), 'a\u{10FFFF}b');

throws(() => {
  parse('"a\\u{110000}b"');
}, new SyntaxError('Undefined Unicode code-point'));

strictEqual(parse('"a\\xfbb"'), 'a\xfbb');

strictEqual(parse('"foo\\\rbar"'), 'foobar');

strictEqual(parse('"foo\\\nbar"'), 'foobar');

strictEqual(parse('"foo\\\r\nbar"'), 'foobar');

throws(() => {
  parse('"foo\rbar"');
}, SyntaxError);

throws(() => {
  parse('"foo\nbar"');
}, SyntaxError);

strictEqual(parse('"foo\fbar"'), 'foo\fbar');

strictEqual(parse('"${hej}"'), '${hej}');

/**
 * TemplateLiteral
 */

strictEqual(parse('``'), '');

strictEqual(parse('`hello \\`friend\\``'), 'hello `friend`');

strictEqual(parse('`foo${42}baz`'), `foo${42}baz`);

strictEqual(parse('`foo${`abc${-42}def`}baz`'), `foo${`abc${-42}def`}baz`);

strictEqual(parse('`(${new Array()})`'), `(${[]})`);

strictEqual(parse('`(${["foo", "bar"]})`'), `(${['foo', 'bar']})`);

strictEqual(parse('`foo\nbar`'), 'foo\nbar');

strictEqual(parse('`foo\rbar`'), 'foo\rbar');

strictEqual(parse('`foo\r\nbar`'), 'foo\r\nbar');

strictEqual(parse('`foo\r\n\n\rbar`'), 'foo\r\n\n\rbar');

strictEqual(parse('`foo\\\nbar`'), 'foobar');

/**
 * ArrayExpression
 */

deepStrictEqual(parse('[]'), []);

deepStrictEqual(parse('[ ]'), []);

deepStrictEqual(parse('[,]'), [,]);

deepStrictEqual(parse('[ , ]'), [,]);

deepStrictEqual(parse('[,,]'), [, ,]);

deepStrictEqual(parse('[ , , ]'), [, ,]);

deepStrictEqual(parse('[,3]'), [, 3]);

deepStrictEqual(parse('[ , 3 ]'), [, 3]);

deepStrictEqual(parse('[1,2,]'), [1, 2]);

deepStrictEqual(parse('[ 1 , 2 , ]'), [1, 2]);

deepStrictEqual(parse('[ 1 , "foo" , [] , {} , ]'), [1, 'foo', [], {}]);

/**
 * ObjectExpression
 */

deepStrictEqual(parse('{}'), {});

throws(() => {
  parse('{}', { strict: true });
}, SyntaxError);

deepStrictEqual(parse('  {}'), {});

throws(() => {
  parse('  {}', { strict: true });
}, SyntaxError);

throws(() => {
  parse('({}');
}, SyntaxError);

throws(() => {
  parse('{})');
}, SyntaxError);

deepStrictEqual(parse('({})'), {});

deepStrictEqual(parse('({ 0: 3 })'), { 0: 3 });

deepStrictEqual(parse('( { .3 : 3 } )'), { 0.3: 3 });

deepStrictEqual(parse('({ 1_2: 3 })'), { 1_2: 3 });

throws(() => {
  parse('({ 0_2: 3 })');
}, SyntaxError);

deepStrictEqual(parse('({foo:1})'), { foo: 1 });

deepStrictEqual(parse('({ foo : 1 })'), { foo: 1 });

throws(() => {
  parse('({ a: 1, 2 })');
}, SyntaxError);

deepStrictEqual(parse('({hello:"test",})'), { hello: 'test' });

deepStrictEqual(parse('({ hello: "test", })'), { hello: 'test' });

deepStrictEqual(parse('({ "hello friend": [] })'), {
  'hello friend': [],
});

throws(() => {
  parse('({ "yes" })');
}, SyntaxError);

deepStrictEqual(parse('({"a":1,b:2})'), { a: 1, b: 2 });

throws(() => {
  parse('({ `foo`: 3 })');
}, SyntaxError);

/**
 * UnaryExpression
 */

throws(() => {
  parse('+ 123');
}, SyntaxError);

strictEqual(parse('-123'), -123);

throws(() => {
  parse('- 123');
}, SyntaxError);

throws(() => {
  parse('+-123');
}, SyntaxError);

throws(() => {
  parse('-+-123');
}, SyntaxError);

throws(() => {
  parse('+-+-123');
}, SyntaxError);

throws(() => {
  parse('--123');
}, SyntaxError);

throws(() => {
  parse('++123');
}, SyntaxError);

throws(() => {
  parse('-(-123)');
});

throws(() => {
  parse('-(+123)');
});

throws(() => {
  parse('-(+-123)');
});

throws(() => {
  parse('-+-+-(+-123)');
});

/**
 * NewExpression
 */

deepStrictEqual(parse('new Date(1328459820000)'), new Date(1328459820000));

deepStrictEqual(parse('new Error("Some error")'), new Error('Some error'));

deepStrictEqual(
  parse('new RangeError("Inherited error")'),
  new RangeError('Inherited error'),
);

deepStrictEqual(parse('new Map'), new Map());

deepStrictEqual(
  parse('new Map([["foo",37],[true,null]])'),
  new Map<unknown, unknown>([
    ['foo', 37],
    [true, null],
  ]),
);

deepStrictEqual(parse('new RegExp("^fo.*bar?$","g")'), /^fo.*bar?$/g);

deepStrictEqual(parse('new Set(["foo","bar"])'), new Set(['foo', 'bar']));

deepStrictEqual(parse('new Boolean(true)'), new Boolean(true));

deepStrictEqual(parse('new Number(42)'), new Number(42));

deepStrictEqual(parse('new String("foo")'), new String('foo'));

deepStrictEqual(parse('new Array()'), []);

deepStrictEqual(parse('new Array("foo")'), new Array('foo'));

deepStrictEqual(parse('new Array(["foo"])'), new Array(['foo']));

deepStrictEqual(parse('new Array(["foo", "bar"])'), new Array(['foo', 'bar']));

deepStrictEqual(parse('new Array([, , "bar"])'), new Array([, , 'bar']));

deepStrictEqual(parse('new Array([, , , ])'), new Array([, , ,]));

deepStrictEqual(parse('new Array(3)'), new Array(3));

deepStrictEqual(parse('new Object({ foo: 3 })'), new Object({ foo: 3 }));

strictEqual(
  parse('new Function("...a","return ((a, b) => a + b)(...a);")')(3, 4),
  7,
);

throws(() => {
  parse('new foo');
}, new ReferenceError('foo is not defined'));

throws(() => {
  parse('new {}');
}, new SyntaxError("Unexpected character '{' at index 4"));

/**
 * GroupExpression
 */

throws(() => {
  parse('()');
}, SyntaxError);

strictEqual(parse('(null)'), null);

strictEqual(parse('( null )'), null);

deepStrictEqual(parse('([true, (false), ((({})))])'), [true, false, {}]);

/**
 * RegExpLiteral
 */

deepStrictEqual(parse('/foo.*bar/'), /foo.*bar/);

throws(() => {
  parse('/foo');
}, SyntaxError);

deepStrictEqual(parse('/foo\\/bar/'), /foo\/bar/);

throws(() => {
  parse('/foo/bar/');
}, SyntaxError);

deepStrictEqual(parse('/foo[/]bar/'), /foo[/]bar/);

throws(() => {
  parse('/foo[bar/');
}, SyntaxError);

deepStrictEqual(parse('/foo[0-9/a-z/]bar/'), /foo[0-9/a-z/]bar/);

deepStrictEqual(parse('/foo0-9]/'), /foo0-9]/);

deepStrictEqual(parse('/foo[\\]]bar/'), /foo[\]]bar/);

deepStrictEqual(parse('/foo[0-9\\]a-z[]bar/'), /foo[0-9\]a-z[]bar/);

deepStrictEqual(parse('/foo[[]/'), /foo[[]/);

deepStrictEqual(parse('/foo[]]/'), /foo[]]/);

deepStrictEqual(parse('/foo[]][^]]/'), /foo[]][^]]/);

deepStrictEqual(parse('/^.*foo[^\\]]$/'), /^.*foo[^\]]$/);

deepStrictEqual(parse('/g/g'), /g/g);

deepStrictEqual(parse('/^.*foo[^\\]]$/gimsuy'), /^.*foo[^\]]$/gimsuy);

throws(() => {
  parse('/^.*foo[^]]$/gimsuyd');
}, SyntaxError);

/**
 * (inline comment)
 */

strictEqual(parse('//'), undefined);

strictEqual(parse('// '), undefined);

strictEqual(parse('//\n'), undefined);

deepStrictEqual(
  parse(`[//test
    //test
    'foo',//test
    //test
    42,//test
    //test
  ]`),
  ['foo', 42],
);

deepStrictEqual(
  parse(`
    new//test
    //test
    Array()//test
  `),
  [],
);

deepStrictEqual(
  parse(`[
    'foo',//test
    //test
    'bar'//test
  ]`),
  ['foo', 'bar'],
);

deepStrictEqual(
  parse(`[
    34,//test
    -5e6//test
  ]`),
  [34, -5e6],
);

deepStrictEqual(
  parse(`({//test
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
  parse(`({
    // Do something.})
  `);
}, SyntaxError);

/**
 * (block comment)
 */

throws(() => {
  parse('/*');
}, SyntaxError);

throws(() => {
  parse('/**');
}, SyntaxError);

strictEqual(parse('/**/'), undefined);

strictEqual(parse(' /*  */ '), undefined);

strictEqual(parse('/* Hello world! */'), undefined);

deepStrictEqual(parse('[/**/1/*/**/, /** //*/2/**/]'), [1, 2]);

deepStrictEqual(
  parse(`[/*
    */'foo',/*
    */42,/*
  */]`),
  ['foo', 42],
);

deepStrictEqual(
  parse(`/*
    */new/*
    */Array()/*
  */`),
  [],
);

deepStrictEqual(
  parse(`[/*
    */'foo',/*
    *///test
    /*
    */'bar'/*
  */]`),
  ['foo', 'bar'],
);

deepStrictEqual(
  parse(`[/*
    */34,/*/
    */-5e6/*
  */]`),
  [34, -5e6],
);

deepStrictEqual(
  parse(`({/*
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

  deepStrictEqual(parse(data), {
    inf: Infinity,
    und: undefined,
    date: new Date('2021-04-14'),
    map: new Map([['foo', 'bar']]),
    set: new Set([Infinity, 'yes']),
    reg: new RegExp('^foo$', 'g'),
  });
});
