export const TS_ESCAPEABLE_REGEXP = /[\0'\\\n\r\v\t\b\f]/g;
export const TS_IDENTIFIER_REGEXP = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
export const TS_INTEGER_REGEXP = /^0|[1-9][0-9]*$/;

export const stringifyString = (value: string) => {
  let string = '';

  string += "'";
  string += value.replace(TS_ESCAPEABLE_REGEXP, (match) => {
    switch (match) {
      case '\0':
        return '\\0';
      case "'":
        return "\\'";
      case '\\':
        return '\\\\';
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '\v':
        return '\\v';
      case '\t':
        return '\\t';
      case '\b':
        return '\\b';
      case '\f':
        return '\\f';
      default:
        return match;
    }
  });
  string += "'";

  return string;
};
