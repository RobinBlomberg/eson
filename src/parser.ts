import { stringifyString } from './stringify-string';
import { ParserOptions, Pattern } from './types';

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

export const parse = (data: string, options: ParserOptions = {}) => {
  const errors: unknown[] = [];
  let isStart = true;
  let index = 0;

  const consume = () => {
    isStart = false;

    if (index >= data.length) {
      throwSyntaxError();
    }

    return data[index++];
  };

  const consumeChar = <C extends string>(pattern: C) => {
    const char = data[index];
    return char === pattern ? (consume() as C) : throwSyntaxError();
  };

  const consumeMany = (length: number) => {
    isStart = false;

    if (index + length > data.length) {
      throwSyntaxError();
    }

    const start = index;
    index += length;
    return data.slice(start, index);
  };

  const consumePattern = (pattern: Pattern) => {
    const char = data[index] ?? '';
    return pattern(char) ? consume() : throwSyntaxError();
  };

  const consumeIdentifier = () => {
    let name = '';

    name += consumePattern(patterns.identifierStart);

    while (patterns.identifierTail(data[index] ?? '')) {
      name += consume();
    }

    return name;
  };

  const consumeInteger = (pattern: Pattern) => {
    let integer = '';

    integer += consumePattern(pattern);

    while (pattern(data[index] ?? '') || data[index] === '_') {
      if (data[index] === '_') {
        integer += consume();
      }

      integer += consumePattern(pattern);
    }

    return integer.replace(/_/g, '');
  };

  const getVariable = (name: string): any => {
    if (globals[name] === undefined) {
      errors.push(new ReferenceError(`${name} is not defined`));
      return undefined;
    }

    return globals[name];
  };

  const parseArrayExpression = () => {
    consume();

    return parseElements(']');
  };

  const parseElements = (closeChar: string) => {
    const elements: unknown[] = [];
    let i = 0;

    parseSpace();

    while (data[index] !== closeChar) {
      if (data[index] === ',') {
        consume();
        elements.length = ++i;
        parseSpace();
        continue;
      }

      elements[i] = parseGroupExpression();
      i++;

      parseSpace();

      if (data[index] === ',') {
        consume();
        parseSpace();
      } else {
        break;
      }
    }

    consumeChar(closeChar);

    return elements;
  };

  const parseGroupExpression = (): any => {
    if (data[index] === '(') {
      consume();
      parseSpace();

      const value = parseGroupExpression();

      parseSpace();
      consumeChar(')');

      return value;
    }

    return parseValue();
  };

  const parseIdentifier = () => {
    const name = consumeIdentifier();

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
        return parseNewExpression();
      default:
        errors.push(new ReferenceError(`${name} is not defined`));
        return undefined;
    }
  };

  const parseNewExpression = () => {
    parseSpace();

    const name = consumeIdentifier();
    const Constructor = getVariable(name);

    parseSpace();

    let args: unknown[] = [];

    if (data[index] === '(') {
      consume();
      args = parseElements(')');
    }

    try {
      return new Constructor(...args);
    } catch (error: unknown) {
      errors.push(error);
    }

    return undefined;
  };

  const parseNumberLiteral = () => {
    const start = data[index];
    let number = '';

    if (start === '-') {
      number += consume();
    }

    if (start !== '.') {
      if (start === '0') {
        number += consume();

        const char = data[index];
        if (char === 'x' || char === 'X') {
          number += consume();
          number += consumeInteger(patterns.hexDigit);
          return Number(number);
        } else if (char === 'b' || char === 'B') {
          number += consume();
          number += consumeInteger(patterns.binaryDigit);
          return Number(number);
        } else if (char === 'o' || char === 'O') {
          number += consume();
          number += consumeInteger(patterns.octalDigit);
          return Number(number);
        }
      } else {
        number += consumeInteger(patterns.decimalDigit);
      }

      if (data[index] === 'n') {
        consume();
        return BigInt(number);
      }
    }

    if (data[index] === '.') {
      number += consume();

      if (patterns.decimalDigit(data[index] ?? '')) {
        number += consumeInteger(patterns.decimalDigit);
      }

      if (number.length === 1) {
        throwSyntaxError();
      }
    }

    if (data[index] === 'e' || data[index] === 'E') {
      number += consume();

      if (data[index] === '-' || data[index] === '+') {
        number += consume();
      }

      number += consumeInteger(patterns.decimalDigit);
    }

    return Number(number);
  };

  const parseObjectExpression = () => {
    if (options.strict && isStart) {
      throwSyntaxError();
    }

    const object: Record<string, unknown> = {};

    consume();
    parseSpace();

    while (data[index] !== '}') {
      const key = patterns.valueStart(data[index] ?? '')
        ? parseValue()
        : consumeIdentifier();

      parseSpace();
      consumeChar(':');
      parseSpace();
      object[key] = parseGroupExpression();
      parseSpace();

      if (data[index] === ',') {
        consume();
        parseSpace();
      } else {
        break;
      }
    }

    parseSpace();
    consumeChar('}');

    return object;
  };

  const parseRegExpLiteral = () => {
    consume();

    let source = '';
    let flags = '';

    source += consumePattern(patterns.notFslash);

    while (data[index] !== '/') {
      if (data[index] === '\\') {
        source += consumeMany(2);
      }

      if (data[index] === '[') {
        source += consume();

        while (data[index] !== ']') {
          if (data[index] === '\\') {
            source += consume();
          }

          source += consume();
        }

        source += consumeChar(']');
      } else {
        source += consumePattern(patterns.notFslash);
      }
    }

    consumeChar('/');

    while (patterns.regExpFlag(data[index] ?? '')) {
      flags += consume();
    }

    return new RegExp(source, flags);
  };

  const parseSingleCharacterEscapeSequence = () => {
    switch (data[index]) {
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
  };

  const parseSpace = () => {
    const wasStart = isStart;
    let space = '';

    while (data[index]) {
      if (patterns.space(data[index] ?? '')) {
        space += consume();

        while (patterns.space(data[index] ?? '')) {
          space += consume();
        }
      } else if (data[index] === '/') {
        if (data[index + 1] === '/') {
          space += consumeMany(2);

          while (data[index] && data[index] !== '\n' && data[index] !== '\r') {
            space += consume();
          }
        } else if (data[index + 1] === '*') {
          space += consumeMany(2);

          if (!data[index]) {
            throwSyntaxError();
          }

          while (data[index]) {
            if (data[index] === '*' && data[index + 1] === '/') {
              space += consumeMany(2);
              break;
            } else {
              space += consume();

              if (!data[index]) {
                throwSyntaxError();
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

    isStart = wasStart;

    return space;
  };

  const parseStringLiteral = () => {
    const quote = data[index];

    if (!quote) {
      return throwSyntaxError();
    }

    let string = '';

    consume();

    while (data[index] !== quote) {
      if ((data[index] === '\n' || data[index] === '\r') && quote !== '`') {
        throwSyntaxError();
      } else if (data[index] === '\\') {
        consume();

        const char = parseSingleCharacterEscapeSequence();

        if (char) {
          string += char;
          consume();
        } else if (data[index] === '\n' || data[index] === '\r') {
          const cr = data[index] === '\r' ? consume() : '';
          if (cr) {
            if (data[index] === '\n') {
              consume();
            }
          } else {
            consumeChar('\n');
          }
        } else if (data[index] === 'u') {
          let hex = '';

          consume();

          if (data[index] === '{') {
            consume();

            hex += consumePattern(patterns.hexDigit);

            while (patterns.hexDigit(data[index] ?? '')) {
              hex += consume();
            }

            consumeChar('}');

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
            hex += consumePattern(patterns.hexDigit);
            hex += consumePattern(patterns.hexDigit);
            hex += consumePattern(patterns.hexDigit);
            hex += consumePattern(patterns.hexDigit);

            string += String.fromCodePoint(parseInt(hex, 16));
          }
        } else if (data[index] === 'x') {
          consume();

          let hex = '';

          hex += consumePattern(patterns.hexDigit);
          hex += consumePattern(patterns.hexDigit);

          string += String.fromCodePoint(parseInt(hex, 16));
        } else {
          string += consume();
        }
      } else if (
        quote === '`' &&
        data[index] === '$' &&
        data[index + 1] === '{'
      ) {
        consumeMany(2);

        string += parseGroupExpression();

        consumeChar('}');
      } else {
        string += consume();
      }
    }

    consumeChar(quote);

    return string;
  };

  const parseValue = () => {
    switch (data[index]) {
      case '`':
      case '"':
      case "'": {
        return parseStringLiteral();
      }
      case '[': {
        return parseArrayExpression();
      }
      case '{': {
        return parseObjectExpression();
      }
      case '/': {
        return parseRegExpLiteral();
      }
      default: {
        if (patterns.identifierStart(data[index] ?? '')) {
          return parseIdentifier();
        } else if (patterns.numberStart(data[index] ?? '')) {
          return parseNumberLiteral();
        }

        return throwSyntaxError();
      }
    }
  };

  const throwSyntaxError = (): string => {
    if (data[index]) {
      const character = stringifyString(data[index]!);
      throw new SyntaxError(
        `Unexpected character ${character} at index ${index}`,
      );
    } else {
      throw new SyntaxError('Unexpected end of input');
    }
  };

  parseSpace();

  // Fast path - empty input:
  if (index === data.length) {
    return undefined;
  }

  const value = parseGroupExpression();

  parseSpace();

  if (index < data.length) {
    throwSyntaxError();
  }

  if (errors.length >= 1) {
    throw errors[0];
  }

  return value;
};
