export type ConstructorParameterGetter = (value: any) => unknown[];

export type ParserContext = {
  unary: UnaryOperator | null;
};

export type UnaryOperator = '+' | '-' | null;
