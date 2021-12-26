import { stringifyString } from '../ts-grammar';
import { Pattern } from './types';

export class Parser {
  protected data = '';
  protected index = 0;

  protected get char() {
    return this.data[this.index] ?? '';
  }

  protected _consume(length = 1) {
    let string = '';

    for (let i = 0; i < length; i++) {
      if (!this.char) {
        this._error();
      }

      string += this.data[this.index];
      this.index++;
    }

    return string;
  }

  protected _error() {
    if (this.char) {
      const char = stringifyString(this.char);
      throw new SyntaxError(
        `Unexpected character ${char} at index ${this.index}`,
      );
    } else {
      throw new SyntaxError('Unexpected end of input');
    }
  }

  protected _one<P extends Pattern>(pattern: P) {
    const char = this.char;

    if (!this._optional(pattern)) {
      this._error();
    }

    return char;
  }

  protected _optional<P extends Pattern>(pattern: P) {
    return this._test(pattern) ? this._consume() : '';
  }

  protected _optionalSequence<P extends readonly Pattern[]>(patterns: P) {
    return this._testSequence(patterns) ? this._consume(patterns.length) : '';
  }

  protected _plus<P extends Pattern>(pattern: P) {
    return this._one(pattern) + this._star(pattern);
  }

  protected _star<P extends Pattern>(pattern: P) {
    let string = '';

    while (this._test(pattern)) {
      string += this._consume();
    }

    return string;
  }

  protected _test<P extends Pattern>(pattern: P, offset = 0): boolean {
    const char = this.data[this.index + offset];

    if (char === undefined) {
      return false;
    } else if (typeof pattern === 'string') {
      return char === pattern;
    } else if (pattern instanceof RegExp) {
      return pattern.test(char);
    }

    return true;
  }

  protected _testNot<P extends Pattern>(char: P) {
    return this.char && !this._test(char);
  }

  protected _testSequence<P extends readonly Pattern[]>(patterns: P) {
    for (let i = 0; i < patterns.length; i++) {
      const childPattern = patterns[i]!;

      if (!this._test(childPattern, i)) {
        return false;
      }
    }

    return true;
  }
}
