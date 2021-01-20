// Model errors
export class NoModelsError extends Error {
    constructor() {
        super('No models.');
    }
}

export class ModelNotFoundError extends Error {
    constructor(modelId: string) {
        super(`Model not found: ${modelId}`);
    }
}

export class NoSelectedModelError extends Error {
    constructor() {
        super('No selected model.');
    }
}

export class UnexpectedModelError extends Error {
    constructor(msg: string) {
        super(`Unexpected model: ${msg}`);
    }
}

export class InvalidModelResponseError extends Error {
    constructor(msg: string) {
        super(`Unexpected response from model: ${msg}`);
    }
}

// Action errors
export class UnknownActionError extends Error {
    constructor(actionName: string) {
        super(`Unknown action: ${actionName}`);
    }
}

// State errors
export class UnknownStateError extends Error {
    constructor(state: any) {
        super(`Unknown state: ${state.constructor.name}`);
    }
}

// Example errors
export class UngroupedExamplesError extends Error {
    constructor() {
        super(`The examples aren't grouped but are expected to be.`);
    }
}

export class GroupedExamplesError extends Error {
    constructor() {
        super(`The examples are grouped but are expected not to be.`);
    }
}

export class DuplicateDisplayPropValueError extends Error {
    constructor(propName: string, value: string) {
        super(
            `The ${propName} property isn't unique, "${value}" is duplicated in several examples.`
        );
    }
}

export class InvalidDisplayPropError extends Error {
    constructor(prop: string) {
        super(`No property named ${prop} exists on the loaded examples.`);
    }
}

// Config errors
export class ConfigError extends Error {
    constructor(message: string) {
        super(`Configuration Error: ${message}`);
    }
}

// Highlight errors
export class InvalidHighlightRangeError extends Error {
    constructor(msg: string) {
        super(`Invalid Highlight Range: ${msg}`);
    }
}

export class InvalidTokenSequenceError extends Error {
    constructor(msg: string) {
        super(`Invalid Token Sequence: ${msg}`);
    }
}
