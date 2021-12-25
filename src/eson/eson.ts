import { parse } from './parser';
import { stringify } from './stringifier';

/**
 * An intrinsic object that provides functions to convert JavaScript values to and from the
 * ECMAScript Object Notation (ESON) format.
 */
export class ESON {
  /**
   * Converts a ECMAScript Object Notation (ESON) string into an object.
   *
   * @param text — A valid ESON string.
   */
  static parse(text: string) {
    return parse(text);
  }

  /**
   * Converts a JavaScript value to a ECMAScript Object Notation (ESON) string.
   *
   * @param value A JavaScript value, usually an object or array, to be converted.
   */
  static stringify(value: any) {
    return stringify(value);
  }
}
