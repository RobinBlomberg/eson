const SINGLE_QUOTE_OR_ESCAPE_REGEXP = /(['\\])/g;

export const stringifyString = (string: string) => {
  return `'${string.replace(SINGLE_QUOTE_OR_ESCAPE_REGEXP, '\\$1')}'`;
};
