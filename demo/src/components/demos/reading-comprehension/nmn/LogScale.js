export class LogScale {
    // We shift the provided values by 1, as to handle the fact that our value
    // range is from 0 to 1, inclusive. This is to avoid the fact that log(0) is
    // -Infinity.
    static SHIFT = 1;
    /**
     * @param {number[]} range  A tuple with the desired min and max range for the scale.
     * @param {number[]} values A tuple with the min and max values to be scaled to the provided
     *                          range.
     */
    constructor(range, values) {
      this.range = range;
      this.values = values.map(v => Math.log(v + LogScale.SHIFT));
      this.factor = (this.values[1] - this.values[0]) / (this.range[1] - this.range[0]);
    }
    scale(value) {
      return this.range[0] + (Math.log(value + LogScale.SHIFT) - this.values[0]) / this.factor;
    }
    value(pos) {
      return Math.exp((pos - this.range[0]) * this.factor + this.values[0]) - LogScale.SHIFT;
    }
  }
