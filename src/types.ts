export type ConstructorParameterGetter = (value: any) => unknown[];

export type ParserContext = {
  data: string;
  errors: unknown[];
  index: number;
  isStart: boolean;
  options: ParserOptions;
};

export type ParserOptions = {
  strict?: boolean;
};

export type Pattern = (char: string) => boolean;
