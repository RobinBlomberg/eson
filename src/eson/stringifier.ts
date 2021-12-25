import { stringifyString, TS_IDENTIFIER_REGEXP } from '../ts-grammar';
import { getConstructor } from './object-parameters';

class Stringifier {
  private stringifyArrayExpression(value: unknown[]) {
    for (let i = 0; i < value.length; i++) {
      if (Object.prototype.hasOwnProperty.call(value, i)) {
        const elements = this.stringifyElements(value);
        return `[${elements}]`;
      }
    }

    return value.length === 0 ? '[]' : `new Array(${value.length})`;
  }

  private stringifyElements(elements: unknown[]) {
    let string = '';

    for (let i = 0; i < elements.length; i++) {
      if (i >= 1) {
        string += ',';
      }

      if (Object.prototype.hasOwnProperty.call(elements, i)) {
        string += this.stringifyValue(elements[i]);
      }
    }

    return string;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private stringifyObjectExpression(value: Record<string, any>) {
    const constructor = getConstructor(value);
    let string = '';

    if (constructor) {
      const args = this.stringifyElements(constructor.parameters);
      string = `new ${constructor.name}(${args})`;
    } else {
      let i = 0;

      string += '{';

      for (const key of Object.keys(value)) {
        if (i >= 1) {
          string += ',';
        }

        string += TS_IDENTIFIER_REGEXP.test(key) ? key : stringifyString(key);
        string += ':';
        string += this.stringifyValue(value[key]);

        i++;
      }

      string += '}';
    }

    return string;
  }

  private stringifyValue(value: unknown) {
    if (Array.isArray(value)) {
      return this.stringifyArrayExpression(value);
    } else if (value instanceof Object) {
      return this.stringifyObjectExpression(value);
    } else if (typeof value === 'string') {
      return stringifyString(value);
    } else if (typeof value === 'bigint') {
      return `${value}n`;
    }

    return String(value);
  }

  stringify(value: unknown) {
    let string = this.stringifyValue(value);

    if (string[0] === '{') {
      string = `(${string})`;
    }

    return string;
  }
}

const stringifier = new Stringifier();

export const stringify = (value: unknown) => {
  return stringifier.stringify(value);
};

export { Stringifier };
