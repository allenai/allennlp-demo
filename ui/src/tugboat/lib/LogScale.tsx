export class LogScale {
    public values: number[];
    public factor: number;

    constructor(
        public range: [number, number], // The desired min and max range for the scale.
        values: [number, number] // The min and max values to be scaled to the provided range.
    ) {
        this.values = values.map((v) => Math.log(v));
        this.factor = (this.values[1] - this.values[0]) / (this.range[1] - this.range[0]);
    }

    scale(value: number) {
        return this.range[0] + (Math.log(value) - this.values[0]) / this.factor;
    }

    value(pos: number) {
        if (pos === 0) {
            return 0;
        }
        return Math.exp((pos - this.range[0]) * this.factor + this.values[0]);
    }
}
