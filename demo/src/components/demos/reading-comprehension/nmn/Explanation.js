export class Output {
  /**
   * @param {string}       inputName
   * @param {number[]}     values
   * @param {string|null}  label
   */
  constructor(inputName, values, label = null) {
    this.inputName = inputName;
    this.values = values;
    this.label = label;
  }
}

export class Step {
  /**
   * @param {string}   moduleName
   * @param {Output[]} outputs
   */
  constructor(moduleName, outputs) {
    this.moduleName = moduleName;
    this.outputs = outputs;
  }

  getOutputsForInput(inputName) {
    return this.outputs.filter(o => o.inputName === inputName);
  }
}

export class Input {
  /**
   * @param {string}    name
   * @param {string[]}  tokens
   */
  constructor(name, tokens) {
    this.name = name;
    this.tokens = tokens;
  }
}

export class Explanation {
  /**
   * @param {string}    answer
   * @param {Input[]}   inputs
   * @param {Step[]}    steps
   */
  constructor(answer, inputs, steps) {
    this.answer = answer;
    this.inputs = inputs;
    this.steps = steps;
  }

  /**
   * Returns an Explanation instance, provided a raw response from the inference API.
   *
   * @param   {object}      response
   * @returns {Explanation}
   */
  static fromResponse(response) {
    const inputs = response.inputs.map(i => new Input(i.name, i.tokens));

    const steps = [];
    for(const step of response.program_execution) {
      const moduleNames = Object.getOwnPropertyNames(step);
      for (const moduleName of moduleNames) {
        const outputs = step[moduleName].map(o => new Output(o.input_name, o.values, o.label));
        steps.push(new Step(moduleName, outputs));
      }
    }

    return new Explanation(
      response.answer,
      inputs,
      steps
    );
  }
}
