import { NMNPrediction } from '../types';

interface Output {
    inputName: string;
    values: number[];
    label?: string;
}

export class Step {
    constructor(public moduleName: string, public outputs: Output[]) {}

    getOutputsForInput(inputName: string) {
        return this.outputs.filter((o) => o.inputName === inputName);
    }
}

export interface Input {
    name: string;
    tokens: string[];
}

export class Explanation {
    constructor(public answer: string, public inputs: Input[], public steps: Step[]) {}

    // Returns an Explanation instance, provided a raw response from the inference API.
    static fromResponse(response: NMNPrediction): Explanation {
        const inputs = response.inputs.map((i) => {
            return { name: i.name, tokens: i.tokens };
        });

        const steps = [];
        for (const step of response.program_execution) {
            for (const [key, value] of Object.entries(step)) {
                const outputs: Output[] = value.map((o) => {
                    return {
                        inputName: o.input_name,
                        values: o.values,
                        label: o.label,
                    };
                });
                steps.push(new Step(key, outputs));
            }
        }

        return new Explanation(response.answer, inputs, steps);
    };
}
