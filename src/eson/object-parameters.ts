import { ConstructorParameterGetter } from './types';

export const ConstructorParameterGetters = new Map<
  Function,
  ConstructorParameterGetter
>([
  [
    Boolean,
    (boolean: boolean) => {
      return [boolean.valueOf()];
    },
  ],
  [
    Date,
    (date: Date) => {
      return [date.valueOf()];
    },
  ],
  [
    Error,
    (error: Error) => {
      return [error.message];
    },
  ],
  [
    Function,
    (fn: Function) => {
      return ['...a', `return (${fn.toString()})(...a);`];
    },
  ],
  [
    Map,
    (map: Map<unknown, unknown>) => {
      return [[...map.entries()]];
    },
  ],
  [
    Number,
    (number: number) => {
      return [number.valueOf()];
    },
  ],
  [
    RegExp,
    (regExp: RegExp) => {
      return [regExp.source, regExp.flags];
    },
  ],
  [
    Set,
    (set: Set<unknown>) => {
      return [[...set.values()]];
    },
  ],
  [
    String,
    (string: string) => {
      return [string.valueOf()];
    },
  ],
]);

export const getConstructor = (value: Record<string, unknown>) => {
  let { constructor } = value;
  const { name } = constructor;

  while (typeof constructor === 'function') {
    const getParameters = ConstructorParameterGetters.get(constructor);

    if (getParameters) {
      const parameters = getParameters(value);

      return {
        name,
        parameters,
      };
    }

    constructor = Object.getPrototypeOf(constructor);
  }

  return null;
};
