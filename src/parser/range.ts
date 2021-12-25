export class Range<TMin extends string = string, TMax extends string = string> {
  max: TMax;
  min: TMin;

  constructor(min: TMin, max: TMax) {
    this.max = max;
    this.min = min;
  }
}
