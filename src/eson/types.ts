export type ConstructorParameterGetter = (value: any) => unknown[];

export type ParserContext = {
  unary: UnaryOperator | null;
};

export type ParserOptions = {
  strict?: boolean;
};

export type UnaryOperator = '+' | '-' | null;
