export class LogScale {
    /**
     * @param {number[]} range  A tuple with the desired min and max range for the scale.
     * @param {number[]} values A tuple with the min and max values to be scaled to the provided
     *                          range.
     */
    constructor(range, values) {
      this.range = range;
      this.values = values.map(v => Math.log(v));
      this.factor = (this.values[1] - this.values[0]) / (this.range[1] - this.range[0]);
    }
    scale(value) {
      return this.range[0] + (Math.log(value) - this.values[0]) / this.factor;
    }
    value(pos) {
      if (pos === 0) {
        return 0;
      }
      return Math.exp((pos - this.range[0]) * this.factor + this.values[0]);
    }
  }
