({
  "foo": 'hello',
  number: new Date(),
  inf: Infinity,
  undefined: undefined,
  regex: /hej.*[a-z0-9]/,
  num: 8e3,
  map: new Map([
    ['foo', 'bar']
  ]),
  set: new Set(['foo', 'bar']),
  binary: 0b010010,
  hex: 0x1f3b,
  // error: new RangeError('Något gick fel.'),
  xyz: [
    {
      foo: 'bar',
    }
  ],
  fn: new Function('...a', 'return ((a, b) => a + b)(...a);'),
})
