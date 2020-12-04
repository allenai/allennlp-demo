import { Action } from './action';
import { State } from './state';

export class UnknownAction extends Error {
    constructor(a: Action) {
        super(`Unknown action: ${a.constructor.name}`);
    }
}

export class InvalidState extends Error {
    constructor(actual: State) {
        super(`Current state is ${actual.constructor.name}, which is unexpected`);
    }
}

export class NoModels extends Error {
    constructor() {
        super('No models to select from.');
    }
}

export class ModelNotFound extends Error {
    constructor(modelId: string) {
        super(`Model with id ${modelId} not found.`);
    }
}
