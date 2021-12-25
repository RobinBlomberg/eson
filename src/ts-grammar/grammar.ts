export const TS_IDENTIFIER_REGEXP = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
export const TS_INTEGER_REGEXP = /^0|[1-9][0-9]*$/;
export const TS_SINGLE_QUOTE_STRING_ESCAPEABLE_REGEXP = /(['\\])/g;

export const stringifyString = (value: string) => {
  let string = '';

  string += "'";
  string += value.replace(TS_SINGLE_QUOTE_STRING_ESCAPEABLE_REGEXP, '\\$1');
  string += "'";

  return string;
};
