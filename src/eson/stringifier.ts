import { stringifyString, TS_IDENTIFIER_REGEXP } from '../ts-grammar';
import { getConstructor } from './object-parameters';

class Stringifier {
  private stringifyArrayExpression(
    value: unknown[],
    space: number,
    depth: number,
  ) {
    for (let i = 0; i < value.length; i++) {
      if (Object.prototype.hasOwnProperty.call(value, i)) {
        const elements = this.stringifyElements(value, space, depth);
        return `[${elements}]`;
      }
    }

    return value.length === 0 ? '[]' : `new Array(${value.length})`;
  }

  private stringifyElements(elements: unknown[], space: number, depth: number) {
    const multiline =
      Boolean(space) && (elements[0] instanceof Object || elements.length >= 2);
    const indent1 = multiline ? ' '.repeat(space * depth) : '';
    const indent2 = multiline ? ' '.repeat(space * (depth + 1)) : '';
    let string = '';

    for (let i = 0; i < elements.length; i++) {
      if (i >= 1) {
        string += ',';
      }

      if (multiline) {
        string += '\n';
      }

      if (Object.prototype.hasOwnProperty.call(elements, i)) {
        string += indent2;
        string += this.stringifyValue(elements[i], space, depth + 1);
      }
    }

    if (multiline) {
      string += '\n';
      string += indent1;
    }

    return string;
  }

  private stringifyObjectExpression(
    value: Record<string, any>,
    space: number,
    depth: number,
  ) {
    const constructor = getConstructor(value);
    const indent1 = ' '.repeat(space * depth);
    let string = '';

    if (constructor) {
      const args = this.stringifyElements(constructor.parameters, space, depth);
      string = `new ${constructor.name}(${args})`;
    } else {
      const keys = Object.keys(value);
      const indent2 = indent1 + ' '.repeat(space);
      let i = 0;

      string += '{';

      for (const key of keys) {
        if (i >= 1) {
          string += ',';
        }

        if (space) {
          string += '\n';
        }

        string += indent2;
        string += TS_IDENTIFIER_REGEXP.test(key) ? key : stringifyString(key);
        string += ':';

        if (space) {
          string += ' ';
        }

        string += this.stringifyValue(value[key], space, depth + 1);

        i++;
      }

      if (space && keys.length >= 1) {
        string += '\n';
        string += indent1;
      }

      string += '}';
    }

    return string;
  }

  private stringifyValue(value: unknown, space: number, depth: number) {
    if (Array.isArray(value)) {
      return this.stringifyArrayExpression(value, space, depth);
    } else if (value instanceof Object) {
      return this.stringifyObjectExpression(value, space, depth);
    } else if (typeof value === 'string') {
      return stringifyString(value);
    } else if (typeof value === 'bigint') {
      return `${value}n`;
    }

    return String(value);
  }

  stringify(value: unknown, space: number, depth: number) {
    let string = this.stringifyValue(value, space, depth);

    if (string[0] === '{') {
      string = `(${string})`;
    }

    return string;
  }
}

const stringifier = new Stringifier();

export const stringify = (
  value: any,
  replacer?: null,
  space: string | number = 0,
) => {
  return stringifier.stringify(
    value,
    typeof space === 'string' ? parseInt(space, 10) : space,
    0,
  );
};

export { Stringifier };
