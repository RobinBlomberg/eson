import { Pattern } from './types';

export class Negation<P extends Pattern = Pattern> {
  pattern: P;

  constructor(pattern: P) {
    this.pattern = pattern;
  }
}
