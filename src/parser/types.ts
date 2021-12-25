import { CharacterClass } from './character-class';
import { Negation } from './negation';
import { Range } from './range';

export type Pattern = string | CharacterClass | Negation | Range;
