export class Output {
  /**
   * @param {string}            type
   * @param {number[]}          values
   * @param {string|undefined}  label
   */
  constructor(type, values, label = undefined) {
    this.type = type;
    this.values = values;
    this.label = label;
  }
}

export const OutputType = {
  PASSAGE: 'passage_attention',
  QUESTION: 'question_attention',
  NUMBER: 'number_attention'
};

export class Step {
  /**
   * @param {string}   moduleName
   * @param {Output[]} outputs
   */
  constructor(moduleName, outputs) {
    this.moduleName = moduleName;
    this.outputs = outputs;
  }

  /**
   * Returns a list containing all attention values for all outputs.
   *
   * @returns {number[]}
   */
  getAllOutputAttentionValues() {
    return this.outputs.reduce((values, o)=> values.concat(o.values), []);
  }

  getOutputsForInput(inputName) {
    switch(inputName) {
      case InputName.QUESTION:
        return this.outputs.filter(o => o.type === OutputType.QUESTION);
      case InputName.PASSAGE:
        return this.outputs.filter(o => o.type === OutputType.PASSAGE);
      case InputName.NUMBERS:
        return this.outputs.filter(o => o.type === OutputType.NUMBER);
      default:
        return [];
    }
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

export const InputName = {
  QUESTION: 'Question',
  PASSAGE: 'Passage',
  NUMBERS: 'Numbers'
}

export class Explanation {
  /**
   * @param {string}  answer
   * @param {string}  lisp
   * @param {Input[]} inputs
   * @param {Step[]}  steps
   */
  constructor(answer, lisp, inputs, steps) {
    this.answer = answer;
    this.lisp = lisp;
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
    const inputs = [];

    // TODO: This will be derived from response.inputs in the near future.
    if (response.question_tokens) {
      inputs.push(new Input(InputName.QUESTION, response.question_tokens));
    }
    if (response.passage_tokens) {
      inputs.push(new Input(InputName.PASSAGE, response.passage_tokens));
    }
    if (response.numbers) {
      inputs.push(new Input(InputName.NUMBERS, response.numbers));
    }

    const steps = [];
    for(const step of response.program_execution) {
      // Each entry in program_execution is a dictionary where each key is the name of a
      // module and each value is the output for that module. At this point there's a single
      // module per step, that said we simply map each module in each step to a separate step
      // at this point. This might not be correct and can be changed later if that's true.
      const moduleNames = Object.getOwnPropertyNames(step);
      for (const moduleName of moduleNames) {
        // TODO: This will be derived from a list of outputs in the near future.
        const output = step[moduleName];
        const outputs = [];
        if (output.question) {
          outputs.push(new Output(OutputType.QUESTION, output.question));
        }
        if (output.passage) {
          outputs.push(new Output(OutputType.PASSAGE, output.passage));
        }
        if (output.number) {
          outputs.push(new Output(OutputType.NUMBER, output.number));
        }
        steps.push(new Step(moduleName, outputs));
      }
    }

    return new Explanation(
      response.answer,
      response.program_lisp,
      inputs,
      steps
    );
  }
}
