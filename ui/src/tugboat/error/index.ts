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

export class UnknownActionError extends Error {
    constructor(actionName: string) {
        super(`Unknown action: ${actionName}`);
    }
}

export class UnknownStateError extends Error {
    constructor(state: any) {
        super(`Unknown state: ${state.constructor.name}`);
    }
}

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
