import {
  CharacterClass,
  Negation,
  Parser as BaseParser,
  Pattern,
  Range,
} from '../parser';
import { ParserContext, UnaryOperator } from './types';

const UNDERSCORE_REGEXP = /_/g;

const AL = 'a';
const ASTERISK = '*';
const AU = 'A';
const BACKTICK = '`';
const BL = 'b';
const BSLASH = '\\';
const BU = 'B';
const COLON = ':';
const COMMA = ',';
const CR = '\r';
const DOLLAR = '$';
const DOT = '.';
const DQ = '"';
const EL = 'e';
const EQ = '=';
const EU = 'E';
const FF = '';
const FL = 'f';
const FSLASH = '/';
const FU = 'F';
const GL = 'g';
const IL = 'i';
const LBRACKET = '[';
const LCURLY = '{';
const LF = '\n';
const LPAREN = '(';
const MINUS = '-';
const ML = 'm';
const NL = 'n';
const NINE = '9';
const OL = 'o';
const ONE = '1';
const OU = 'O';
const PLUS = '+';
const QUESTION = '?';
const RBRACKET = ']';
const RCURLY = '}';
const RL = 'r';
const RPAREN = ')';
const SEVEN = '7';
const SL = 's';
const SPACE = ' ';
const SQ = "'";
const TAB = '\t';
const TL = 't';
const UL = 'u';
const US = '_';
const VL = 'v';
const XL = 'x';
const XU = 'X';
const YL = 'y';
const ZERO = '0';
const ZL = 'z';
const ZU = 'Z';

const R_ALPHA_L = new Range(AL, ZL);
const R_ALPHA_U = new Range(AU, ZU);
const R_BINARY_DIGIT = new Range(ZERO, ONE);
const R_BINARY_DIGIT_US = new CharacterClass([new Range(ZERO, ONE), US]);
const R_BINARY_PREFIX = new CharacterClass([BL, BU]);
const R_DIGIT = new Range(ZERO, NINE);
const R_DIGIT_DOT = new CharacterClass([R_DIGIT, DOT]);
const R_DIGIT_US = new CharacterClass([R_DIGIT, US]);
const R_EXPONENT = new CharacterClass([EL, EU]);
const R_HEX_ALPHA_L = new Range(AL, FL);
const R_HEX_ALPHA_U = new Range(AU, FU);
const R_HEX_DIGIT = new CharacterClass([R_DIGIT, R_HEX_ALPHA_U, R_HEX_ALPHA_L]);
const R_HEX_DIGIT_US = new CharacterClass([
  R_DIGIT,
  R_HEX_ALPHA_U,
  R_HEX_ALPHA_L,
  US,
]);
const R_HEX_PREFIX = new CharacterClass([XL, XU]);
const R_IDENTIFIER_START = new CharacterClass([
  R_ALPHA_L,
  R_ALPHA_U,
  US,
  DOLLAR,
]);
const R_IDENTIFIER_TAIL = new CharacterClass([
  R_ALPHA_L,
  R_ALPHA_U,
  US,
  DOLLAR,
  R_DIGIT,
]);
const R_KEY_START = new CharacterClass([DQ, SQ, DOT, R_DIGIT]);
const R_NEWLINE = new CharacterClass([LF, CR]);
const R_NOT_FSLASH = new Negation(FSLASH);
const R_NOT_NEWLINE = new Negation(R_NEWLINE);
const R_OCTAL_DIGIT = new Range(ZERO, SEVEN);
const R_OCTAL_DIGIT_US = new CharacterClass([new Range(ZERO, SEVEN), US]);
const R_OCTAL_PREFIX = new CharacterClass([OL, OU]);
const R_REGEXP_FLAG = new CharacterClass([GL, IL, ML, SL, UL, YL]);
const R_SPACE = new CharacterClass([SPACE, TAB, LF, CR, FF]);
const R_UNARY = new CharacterClass([PLUS, MINUS]);

const SEQ_BLOCK_COMMENT_END = [ASTERISK, FSLASH] as const;
const SEQ_ELLIPSIS = [DOT, DOT, DOT] as const;
const SEQ_TEMPLATE_ELEMENT_START = [DOLLAR, LCURLY] as const;

const I_INFINITY = 'Infinity';
const I_NAN = 'NaN';
const I_FALSE = 'false';
const I_NULL = 'null';
const I_TRUE = 'true';
const I_UNDEFINED = 'undefined';
const I_NEW = 'new';

const GlobalVariables: Record<string, unknown> = {
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

class Parser extends BaseParser {
  errors: unknown[] = [];
  isStart = true;
  variables = GlobalVariables;

  private consumeIdentifier() {
    let name = '';

    name += this._one(R_IDENTIFIER_START);
    name += this._star(R_IDENTIFIER_TAIL);

    return name;
  }

  private consumeInteger(
    digitPattern: Pattern,
    digitOrUnderscorePattern: Pattern,
  ) {
    let integer = '';

    integer += this._one(digitPattern);

    while (this._test(digitOrUnderscorePattern)) {
      integer += this._optional(US);
      integer += this._one(digitPattern);
    }

    return integer.replace(UNDERSCORE_REGEXP, '');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getProperty(object: any, property: any, optional: boolean) {
    if (optional) {
      return object?.[property];
    }

    try {
      return object[property];
    } catch (error: unknown) {
      this.errors.push(error);
      throw this.errors[0];
    }
  }

  private getVariable(name: string) {
    if (!Object.prototype.hasOwnProperty.call(this.variables, name)) {
      this.errors.push(new ReferenceError(`${name} is not defined`));
      return undefined;
    }

    return this.variables[name];
  }

  private parseArrayExpression(context: ParserContext) {
    this._consume();

    return this.parseElements(context, RBRACKET);
  }

  private parseElements(context: ParserContext, closeChar: string) {
    const elements: unknown[] = [];
    let i = 0;

    this.parseSpace();

    while (this._testNot(closeChar)) {
      if (this._optional(COMMA)) {
        elements.length = ++i;

        this.parseSpace();

        continue;
      }

      if (this._optionalSequence(SEQ_ELLIPSIS)) {
        const spreadElement = this.parseMemberExpression(context);

        elements.push(...spreadElement);

        i = elements.length;
      } else {
        elements[i] = this.parseMemberExpression(context);
        i++;
      }

      this.parseSpace();

      if (this._optional(COMMA)) {
        this.parseSpace();
      } else {
        break;
      }
    }

    this._one(closeChar);

    return elements;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseGroupExpression(context: ParserContext): any {
    if (this._optional(LPAREN)) {
      this.parseSpace();

      const value = this.parseSequenceExpression({
        ...context,
        unary: null,
      });

      this.parseSpace();
      this._one(RPAREN);

      return value;
    }

    return this.parseUnaryExpression(context);
  }

  private parseIdentifier(context: ParserContext) {
    const name = this.consumeIdentifier();

    switch (name) {
      case I_INFINITY:
        return Infinity;
      case I_NAN:
        return NaN;
      case I_FALSE:
        return false;
      case I_NULL:
        return null;
      case I_TRUE:
        return true;
      case I_UNDEFINED:
        return undefined;
      case I_NEW:
        return this.parseNewExpression(context);
      default:
        return this.parseVariable(context, name);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseMemberExpression(context: ParserContext): any {
    let property;
    let object = this.parseGroupExpression(context);
    let parent = object;

    this.parseSpace();

    while (this.char) {
      const optional = Boolean(this._optional(QUESTION));
      const dot = this._optional(DOT);

      if (dot) {
        this.parseSpace();

        if (this._test(LBRACKET)) {
          if (!optional) {
            this._error();
          }
        } else {
          property = this.consumeIdentifier();
          parent = object;
          object = this.getProperty(object, property, optional);

          this.parseSpace();

          continue;
        }
      }

      if (optional && !dot) {
        this._error();
      } else if (this._optional(LBRACKET)) {
        this.parseSpace();

        property = this.parseMemberExpression(context);
        parent = object;
        object = this.getProperty(object, property, optional);

        this.parseSpace();
        this._one(RBRACKET);
        this.parseSpace();
      } else {
        break;
      }
    }

    if (this._optional(EQ)) {
      if (property === undefined) {
        throw new SyntaxError('Invalid left-hand side in assignment');
      }

      this.parseSpace();

      const value = this.parseMemberExpression(context);

      parent[property] = value;

      return value;
    }

    return object;
  }

  private parseNewExpression(context: ParserContext) {
    this.parseSpace();

    const Constructor = this.parseMemberExpression(context);

    this.parseSpace();

    let args: unknown[] = [];

    if (this._optional(LPAREN)) {
      args = this.parseElements(context, RPAREN);
    }

    try {
      return new Constructor(...args);
    } catch (error: unknown) {
      this.errors.push(error);
    }

    return undefined;
  }

  private parseNumberLiteral() {
    const start = this.char;
    let number = '';

    if (start !== DOT) {
      if (start === ZERO) {
        number += this._consume();

        if (this._test(R_HEX_PREFIX)) {
          number += this._consume();
          number += this.consumeInteger(R_HEX_DIGIT, R_HEX_DIGIT_US);
          return Number(number);
        } else if (this._test(R_BINARY_PREFIX)) {
          number += this._consume();
          number += this.consumeInteger(R_BINARY_DIGIT, R_BINARY_DIGIT_US);
          return Number(number);
        } else if (this._test(R_OCTAL_PREFIX)) {
          number += this._consume();
          number += this.consumeInteger(R_OCTAL_DIGIT, R_OCTAL_DIGIT_US);
          return Number(number);
        }
      } else {
        number += this.consumeInteger(R_DIGIT, R_DIGIT_US);
      }

      if (this._optional(NL)) {
        return BigInt(number);
      }
    }

    if (this._test(DOT)) {
      number += this._consume();

      if (this._test(R_DIGIT)) {
        number += this.consumeInteger(R_DIGIT, R_DIGIT_US);
      }

      if (number.length === 1) {
        this._error();
      }
    }

    if (this._test(R_EXPONENT)) {
      number += this._consume();
      number += this._optional(R_UNARY);
      number += this.consumeInteger(R_DIGIT, R_DIGIT_US);
    }

    return Number(number);
  }

  private parseObjectExpression(context: ParserContext) {
    if (this.isStart) {
      this._error();
    }

    const object: Record<string, unknown> = {};

    this._consume();
    this.parseSpace();

    while (this._testNot(RCURLY)) {
      let key = '';

      if (this._optionalSequence(SEQ_ELLIPSIS)) {
        const value = this.parseMemberExpression(context);

        Object.assign(object, value);
      } else {
        let isIdentifier = false;

        if (this._optional(LBRACKET)) {
          key += this.parseMemberExpression(context);

          this._one(RBRACKET);
        } else if (this._test(R_KEY_START)) {
          key += this.parseValue(context);
        } else {
          key += this.consumeIdentifier();
          isIdentifier = true;
        }

        this.parseSpace();

        if (this._optional(COLON)) {
          this.parseSpace();

          object[key] = this.parseMemberExpression(context);
        } else if (isIdentifier) {
          object[key] = this.getVariable(key);
        } else {
          this._error();
        }
      }

      this.parseSpace();

      if (this._optional(COMMA)) {
        this.parseSpace();
      } else {
        break;
      }
    }

    this.parseSpace();
    this._one(RCURLY);

    return object;
  }

  private parseRegExpLiteral() {
    this._consume();

    let source = '';
    let flags = '';

    source += this._one(R_NOT_FSLASH);

    while (this._testNot(FSLASH)) {
      if (this._test(BSLASH)) {
        source += this._consume(2);
      }

      if (this._test(LBRACKET)) {
        source += this._consume();

        while (this._testNot(RBRACKET)) {
          source += this._optional(BSLASH);
          source += this._consume();
        }

        source += this._one(RBRACKET);
      } else {
        source += this._one(R_NOT_FSLASH);
      }
    }

    this._one(FSLASH);

    flags += this._star(R_REGEXP_FLAG);

    return new RegExp(source, flags);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseSequenceExpression(context: ParserContext): any {
    const expressions = [this.parseMemberExpression(context)];

    this.parseSpace();

    while (this._optional(COMMA)) {
      this.parseSpace();

      expressions.push(
        this.parseSequenceExpression({
          ...context,
          unary: null,
        }),
      );
    }

    return expressions[expressions.length - 1];
  }

  private parseSingleCharacterEscapeSequence() {
    switch (this.char) {
      case ZERO:
        return '\0';
      case SQ:
        return "'";
      case BSLASH:
        return '\\';
      case NL:
        return '\n';
      case RL:
        return '\r';
      case VL:
        return '\v';
      case TL:
        return '\t';
      case BL:
        return '\b';
      case FL:
        return '\f';
      default:
        return undefined;
    }
  }

  private parseSpace() {
    const isStart = this.isStart;
    let space = '';

    while (this.char) {
      if (this._test(R_SPACE)) {
        space += this._consume();
        space += this._star(R_SPACE);
      } else if (this._test(FSLASH)) {
        if (this._test(FSLASH, 1)) {
          space += this._consume(2);
          space += this._star(R_NOT_NEWLINE);
        } else if (this._test(ASTERISK, 1)) {
          space += this._consume(2);

          if (!this.char) {
            this._error();
          }

          while (this.char) {
            if (this._testSequence(SEQ_BLOCK_COMMENT_END)) {
              space += this._consume(2);
              break;
            } else {
              space += this._consume();

              if (!this.char) {
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

  private parseStringLiteral(context: ParserContext) {
    const quote = this.char;

    if (!quote) {
      return this._error();
    }

    let string = '';

    this._consume();

    while (this._testNot(quote)) {
      if (this._test(R_NEWLINE) && quote !== BACKTICK) {
        this._error();
      } else if (this._optional(BSLASH)) {
        const char = this.parseSingleCharacterEscapeSequence();

        if (char) {
          string += char;
          this._consume();
        } else if (this._test(R_NEWLINE)) {
          const cr = this._optional(CR);

          if (cr) {
            this._optional(LF);
          } else {
            this._one(LF);
          }
        } else if (this._optional(UL)) {
          let hex = '';

          if (this._optional(LCURLY)) {
            hex += this._one(R_HEX_DIGIT);

            while (this._test(R_HEX_DIGIT)) {
              hex += this._consume();
            }

            this._one(RCURLY);

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
            hex += this._one(R_HEX_DIGIT);
            hex += this._one(R_HEX_DIGIT);
            hex += this._one(R_HEX_DIGIT);
            hex += this._one(R_HEX_DIGIT);

            string += String.fromCodePoint(parseInt(hex, 16));
          }
        } else if (this._optional(XL)) {
          let hex = '';

          hex += this._one(R_HEX_DIGIT);
          hex += this._one(R_HEX_DIGIT);

          string += String.fromCodePoint(parseInt(hex, 16));
        } else {
          string += this._consume();
        }
      } else if (
        quote === BACKTICK &&
        this._optionalSequence(SEQ_TEMPLATE_ELEMENT_START)
      ) {
        string += this.parseSequenceExpression(context);

        this._one(RCURLY);
      } else {
        string += this._consume();
      }
    }

    this._one(quote);

    return string;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseUnaryExpression(context: ParserContext): any {
    let operator: UnaryOperator = null;

    if (context.unary === PLUS) {
      operator = this._optional(MINUS) as UnaryOperator;
    } else if (context.unary === MINUS) {
      operator = this._optional(PLUS) as UnaryOperator;
    } else {
      operator = this._optional(R_UNARY) as UnaryOperator;
    }

    if (operator) {
      this.parseSpace();
    }

    const value = operator
      ? this.parseMemberExpression({
          ...context,
          unary: operator,
        })
      : this.parseValue(context);

    return operator === MINUS ? -value : value;
  }

  private parseValue(context: ParserContext) {
    switch (this.char) {
      case BACKTICK:
      case DQ:
      case SQ: {
        return this.parseStringLiteral(context);
      }
      case LBRACKET: {
        return this.parseArrayExpression(context);
      }
      case LCURLY: {
        return this.parseObjectExpression(context);
      }
      case FSLASH: {
        return this.parseRegExpLiteral();
      }
      default: {
        if (this._test(R_IDENTIFIER_START)) {
          return this.parseIdentifier(context);
        } else if (this._test(R_DIGIT_DOT)) {
          return this.parseNumberLiteral();
        }

        return this._error();
      }
    }
  }

  private parseVariable(context: ParserContext, name: string) {
    this.parseSpace();

    if (this._optional(EQ)) {
      this.parseSpace();

      const value = this.parseMemberExpression(context);

      this.variables[name] = value;

      return value;
    }

    return this.getVariable(name);
  }

  protected _consume(length = 1) {
    this.isStart = false;

    return super._consume(length);
  }

  parse(data: string, variables: Record<string, unknown> = {}) {
    this.data = data;
    this.errors = [];
    this.index = 0;
    this.isStart = true;
    this.variables = { ...GlobalVariables, ...variables };

    this.parseSpace();

    // Fast path - empty input:
    if (this.index === this.data.length) {
      return undefined;
    }

    const value = this.parseSequenceExpression({
      unary: null,
    });

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

export type { ParserContext, UnaryOperator };
export { GlobalVariables, Parser };

export const parse = (
  data: string,
  variables: Record<string, unknown> = {},
) => {
  return parser.parse(data, variables);
};
