import { Range } from './range';

export class CharacterClass<P extends string | Range = string | Range> {
  patterns: P[];

  constructor(patterns: P[]) {
    this.patterns = patterns;
  }
}
