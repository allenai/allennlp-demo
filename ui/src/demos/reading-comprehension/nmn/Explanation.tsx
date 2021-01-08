import { NMNPrediction } from '../types';

class Output {
    constructor(public inputName: string, public values: number[], public label?: string) {}
}

export class Step {
    constructor(public moduleName: string, public outputs: Output[]) {}

    getOutputsForInput = (inputName: string) => {
        return this.outputs.filter((o) => o.inputName === inputName);
    };
}

export class Input {
    constructor(public name: string, public tokens: string[]) {}
}

export class Explanation {
    constructor(public answer: string, public inputs: Input[], public steps: Step[]) {}

    // Returns an Explanation instance, provided a raw response from the inference API.
    static fromResponse = (response: NMNPrediction): Explanation => {
        const inputs = response.inputs.map((i) => new Input(i.name, i.tokens));

        const steps = [];
        for (const step of response.program_execution) {
            for (const [key, value] of Object.entries(step)) {
                const outputs = value.map((o) => new Output(o.input_name, o.values, o.label));
                steps.push(new Step(key, outputs));
            }
        }

        return new Explanation(response.answer, inputs, steps);
    };
}
