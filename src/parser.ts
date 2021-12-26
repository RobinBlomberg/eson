import { stringifyString } from './stringify-string';
import { ParserOptions, Pattern, UnaryOperator } from './types';

const globals: Record<string, unknown> = {
  Array,
  Boolean,
  Date,
  Error,
  EvalError,
  Function,
  Map,
  Number,
  Object,
  RangeError,
  ReferenceError,
  RegExp,
  Set,
  String,
  SyntaxError,
  TypeError,
  URIError,
};

const patterns = {
  binaryDigit: (c: string) => {
    return c === '0' || c === '1';
  },
  decimalDigit: (c: string) => {
    return c >= '0' && c <= '9';
  },
  hexDigit: (c: string) => {
    return (
      (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')
    );
  },
  identifierStart: (c: string) => {
    return (
      (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '$'
    );
  },
  identifierTail: (c: string) => {
    return (
      (c >= 'a' && c <= 'z') ||
      (c >= 'A' && c <= 'Z') ||
      c === '_' ||
      c === '$' ||
      (c >= '0' && c <= '9')
    );
  },
  notFslash: (c: string) => {
    return Boolean(c) && c !== '/';
  },
  numberStart: (c: string) => {
    return (c >= '0' && c <= '9') || c === '-' || c === '.';
  },
  octalDigit: (c: string) => {
    return c >= '0' && c <= '7';
  },
  regExpFlag: (c: string) => {
    return (
      c === 'g' || c === 'i' || c === 'm' || c === 's' || c === 'u' || c === 'y'
    );
  },
  space: (c: string) => {
    return c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '';
  },
  valueStart: (c: string) => {
    return c === '"' || c === "'" || c === '.' || (c >= '0' && c <= '9');
  },
};

class Parser {
  data = '';
  errors: unknown[] = [];
  index = 0;
  isStart = true;
  options: ParserOptions = {};

  private _consume() {
    this.isStart = false;

    if (this.index >= this.data.length) {
      this._error();
    }

    return this.data[this.index++];
  }

  private _consumeChar<C extends string>(pattern: C) {
    const char = this.data[this.index];
    return char === pattern ? (this._consume() as C) : this._error();
  }

  private _consumeMany(length = 1) {
    this.isStart = false;

    if (this.index + length > this.data.length) {
      this._error();
    }

    const start = this.index;
    this.index += length;
    return this.data.slice(start, this.index);
  }

  private _consumePattern(pattern: Pattern) {
    const char = this.data[this.index] ?? '';
    return pattern(char) ? this._consume() : this._error();
  }

  private _error(): string {
    if (this.data[this.index]) {
      const character = stringifyString(this.data[this.index]!);
      throw new SyntaxError(
        `Unexpected character ${character} at index ${this.index}`,
      );
    } else {
      throw new SyntaxError('Unexpected end of input');
    }
  }

  private consumeIdentifier() {
    let name = '';

    name += this._consumePattern(patterns.identifierStart);

    while (patterns.identifierTail(this.data[this.index] ?? '')) {
      name += this._consume();
    }

    return name;
  }

  private consumeInteger(pattern: Pattern) {
    let integer = '';

    integer += this._consumePattern(pattern);

    while (
      pattern(this.data[this.index] ?? '') ||
      this.data[this.index] === '_'
    ) {
      if (this.data[this.index] === '_') {
        integer += this._consume();
      }

      integer += this._consumePattern(pattern);
    }

    return integer.replace(/_/g, '');
  }

  private getVariable(name: string): any {
    if (globals[name] === undefined) {
      this.errors.push(new ReferenceError(`${name} is not defined`));
      return undefined;
    }

    return globals[name];
  }

  private parseArrayExpression() {
    this._consume();

    return this.parseElements(']');
  }

  private parseElements(closeChar: string) {
    const elements: unknown[] = [];
    let i = 0;

    this.parseSpace();

    while (this.data[this.index] !== closeChar) {
      if (this.data[this.index] === ',') {
        this._consume();
        elements.length = ++i;
        this.parseSpace();
        continue;
      }

      elements[i] = this.parseGroupExpression();
      i++;

      this.parseSpace();

      if (this.data[this.index] === ',') {
        this._consume();
        this.parseSpace();
      } else {
        break;
      }
    }

    this._consumeChar(closeChar);

    return elements;
  }

  private parseGroupExpression(): any {
    if (this.data[this.index] === '(') {
      this._consume();
      this.parseSpace();

      const value = this.parseGroupExpression();

      this.parseSpace();
      this._consumeChar(')');

      return value;
    }

    return this.parseValue();
  }

  private parseIdentifier() {
    const name = this.consumeIdentifier();

    switch (name) {
      case 'Infinity':
        return Infinity;
      case 'NaN':
        return NaN;
      case 'false':
        return false;
      case 'null':
        return null;
      case 'true':
        return true;
      case 'undefined':
        return undefined;
      case 'new':
        return this.parseNewExpression();
      default:
        this.errors.push(new ReferenceError(`${name} is not defined`));
        return undefined;
    }
  }

  private parseNewExpression() {
    this.parseSpace();

    const name = this.consumeIdentifier();
    const Constructor = this.getVariable(name);

    this.parseSpace();

    let args: unknown[] = [];

    if (this.data[this.index] === '(') {
      this._consume();
      args = this.parseElements(')');
    }

    try {
      return new Constructor(...args);
    } catch (error: unknown) {
      this.errors.push(error);
    }

    return undefined;
  }

  private parseNumberLiteral() {
    const start = this.data[this.index];
    let number = '';

    if (start === '-') {
      number += this._consume();
    }

    if (start !== '.') {
      if (start === '0') {
        number += this._consume();

        const char = this.data[this.index];
        if (char === 'x' || char === 'X') {
          number += this._consume();
          number += this.consumeInteger(patterns.hexDigit);
          return Number(number);
        } else if (char === 'b' || char === 'B') {
          number += this._consume();
          number += this.consumeInteger(patterns.binaryDigit);
          return Number(number);
        } else if (char === 'o' || char === 'O') {
          number += this._consume();
          number += this.consumeInteger(patterns.octalDigit);
          return Number(number);
        }
      } else {
        number += this.consumeInteger(patterns.decimalDigit);
      }

      if (this.data[this.index] === 'n') {
        this._consume();
        return BigInt(number);
      }
    }

    if (this.data[this.index] === '.') {
      number += this._consume();

      if (patterns.decimalDigit(this.data[this.index] ?? '')) {
        number += this.consumeInteger(patterns.decimalDigit);
      }

      if (number.length === 1) {
        this._error();
      }
    }

    if (this.data[this.index] === 'e' || this.data[this.index] === 'E') {
      number += this._consume();

      if (this.data[this.index] === '-' || this.data[this.index] === '+') {
        number += this._consume();
      }

      number += this.consumeInteger(patterns.decimalDigit);
    }

    return Number(number);
  }

  private parseObjectExpression() {
    if (this.options.strict && this.isStart) {
      this._error();
    }

    const object: Record<string, unknown> = {};

    this._consume();
    this.parseSpace();

    while (this.data[this.index] !== '}') {
      const key = patterns.valueStart(this.data[this.index] ?? '')
        ? this.parseValue()
        : this.consumeIdentifier();

      this.parseSpace();
      this._consumeChar(':');
      this.parseSpace();
      object[key] = this.parseGroupExpression();
      this.parseSpace();

      if (this.data[this.index] === ',') {
        this._consume();
        this.parseSpace();
      } else {
        break;
      }
    }

    this.parseSpace();
    this._consumeChar('}');

    return object;
  }

  private parseRegExpLiteral() {
    this._consume();

    let source = '';
    let flags = '';

    source += this._consumePattern(patterns.notFslash);

    while (this.data[this.index] !== '/') {
      if (this.data[this.index] === '\\') {
        source += this._consumeMany(2);
      }

      if (this.data[this.index] === '[') {
        source += this._consume();

        while (this.data[this.index] !== ']') {
          if (this.data[this.index] === '\\') {
            source += this._consume();
          }

          source += this._consume();
        }

        source += this._consumeChar(']');
      } else {
        source += this._consumePattern(patterns.notFslash);
      }
    }

    this._consumeChar('/');

    while (patterns.regExpFlag(this.data[this.index] ?? '')) {
      flags += this._consume();
    }

    return new RegExp(source, flags);
  }

  private parseSingleCharacterEscapeSequence() {
    switch (this.data[this.index]) {
      case '0':
        return '\0';
      case "'":
        return "'";
      case '\\':
        return '\\';
      case 'n':
        return '\n';
      case 'r':
        return '\r';
      case 'v':
        return '\v';
      case 't':
        return '\t';
      case 'b':
        return '\b';
      case 'f':
        return '\f';
      default:
        return undefined;
    }
  }

  private parseSpace() {
    const isStart = this.isStart;
    let space = '';

    while (this.data[this.index]) {
      if (patterns.space(this.data[this.index] ?? '')) {
        space += this._consume();

        while (patterns.space(this.data[this.index] ?? '')) {
          space += this._consume();
        }
      } else if (this.data[this.index] === '/') {
        if (this.data[this.index + 1] === '/') {
          space += this._consumeMany(2);

          while (
            this.data[this.index] &&
            this.data[this.index] !== '\n' &&
            this.data[this.index] !== '\r'
          ) {
            space += this._consume();
          }
        } else if (this.data[this.index + 1] === '*') {
          space += this._consumeMany(2);

          if (!this.data[this.index]) {
            this._error();
          }

          while (this.data[this.index]) {
            if (
              this.data[this.index] === '*' &&
              this.data[this.index + 1] === '/'
            ) {
              space += this._consumeMany(2);
              break;
            } else {
              space += this._consume();

              if (!this.data[this.index]) {
                this._error();
              }
            }
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }

    this.isStart = isStart;

    return space;
  }

  private parseStringLiteral() {
    const quote = this.data[this.index];

    if (!quote) {
      return this._error();
    }

    let string = '';

    this._consume();

    while (this.data[this.index] !== quote) {
      if (
        (this.data[this.index] === '\n' || this.data[this.index] === '\r') &&
        quote !== '`'
      ) {
        this._error();
      } else if (this.data[this.index] === '\\') {
        this._consume();

        const char = this.parseSingleCharacterEscapeSequence();

        if (char) {
          string += char;
          this._consume();
        } else if (
          this.data[this.index] === '\n' ||
          this.data[this.index] === '\r'
        ) {
          const cr = this.data[this.index] === '\r' ? this._consume() : '';
          if (cr) {
            if (this.data[this.index] === '\n') {
              this._consume();
            }
          } else {
            this._consumeChar('\n');
          }
        } else if (this.data[this.index] === 'u') {
          let hex = '';

          this._consume();

          if (this.data[this.index] === '{') {
            this._consume();

            hex += this._consumePattern(patterns.hexDigit);

            while (patterns.hexDigit(this.data[this.index] ?? '')) {
              hex += this._consume();
            }

            this._consumeChar('}');

            let value = parseInt(hex, 16);

            if (value > 0x10ffff) {
              throw new SyntaxError('Undefined Unicode code-point');
            } else if (value >= 0x10000) {
              value -= 0x10000;

              const high = 0xd800 | ((value >> 10) & 0x3ff);
              const low = 0xdc00 | (value & 0x3ff);

              string += String.fromCodePoint(high, low);
            } else {
              string += String.fromCodePoint(value);
            }
          } else {
            hex += this._consumePattern(patterns.hexDigit);
            hex += this._consumePattern(patterns.hexDigit);
            hex += this._consumePattern(patterns.hexDigit);
            hex += this._consumePattern(patterns.hexDigit);

            string += String.fromCodePoint(parseInt(hex, 16));
          }
        } else if (this.data[this.index] === 'x') {
          this._consume();

          let hex = '';

          hex += this._consumePattern(patterns.hexDigit);
          hex += this._consumePattern(patterns.hexDigit);

          string += String.fromCodePoint(parseInt(hex, 16));
        } else {
          string += this._consume();
        }
      } else if (
        quote === '`' &&
        this.data[this.index] === '$' &&
        this.data[this.index + 1] === '{'
      ) {
        this._consumeMany(2);

        string += this.parseGroupExpression();

        this._consumeChar('}');
      } else {
        string += this._consume();
      }
    }

    this._consumeChar(quote);

    return string;
  }

  private parseValue() {
    switch (this.data[this.index]) {
      case '`':
      case '"':
      case "'": {
        return this.parseStringLiteral();
      }
      case '[': {
        return this.parseArrayExpression();
      }
      case '{': {
        return this.parseObjectExpression();
      }
      case '/': {
        return this.parseRegExpLiteral();
      }
      default: {
        if (patterns.identifierStart(this.data[this.index] ?? '')) {
          return this.parseIdentifier();
        } else if (patterns.numberStart(this.data[this.index] ?? '')) {
          return this.parseNumberLiteral();
        }

        return this._error();
      }
    }
  }

  parse(data: string, options: ParserOptions = {}) {
    this.data = data;
    this.errors = [];
    this.index = 0;
    this.isStart = true;
    this.options = options;

    this.parseSpace();

    // Fast path - empty input:
    if (this.index === this.data.length) {
      return undefined;
    }

    const value = this.parseGroupExpression();

    this.parseSpace();

    if (this.index < this.data.length) {
      this._error();
    }

    if (this.errors.length >= 1) {
      throw this.errors[0];
    }

    return value;
  }
}

const parser = new Parser();

export type { UnaryOperator };
export { Parser };

export const parse = (data: string, options: ParserOptions = {}) => {
  return parser.parse(data, options);
};
