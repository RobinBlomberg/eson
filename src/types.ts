export type ConstructorParameterGetter = (value: any) => unknown[];

export type ParserOptions = {
  strict?: boolean;
};

export type Pattern = (char: string) => boolean;

export type UnaryOperator = '+' | '-' | null;
