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

export class NoSelectedModel extends Error {
    constructor() {
        super('No selected model.');
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

export class InvalidAttributesError extends Error {
    constructor(msg: string) {
        super(`Invalid Attributes: ${msg}`);
    }
}
