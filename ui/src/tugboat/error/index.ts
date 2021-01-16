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
