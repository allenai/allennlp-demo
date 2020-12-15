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