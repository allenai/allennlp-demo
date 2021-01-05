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
    constructor(modelId: string) {
        super(`The type of the response does not match the model: ${modelId}`);
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
