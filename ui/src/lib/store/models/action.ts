import { Model } from '../../Model';
import { Prediction } from '../../Prediction';

export interface Action {}

export class Loading implements Action {
    constructor(readonly modelIds: string[]) {}
}

export class Loaded<I, O> implements Action {
    constructor(readonly modelIds: string[], readonly models: Model<I, O>[]) {}
}

export class Select implements Action {
    constructor(readonly modelId: string) {}
}

export class LoadError implements Action {
    constructor(readonly modelIds: string[], readonly cause: Error) {}
}

export class Predicting<I> implements Action {
    constructor(readonly input: I) {}
}

export class ReceivedPrediction<I, O> implements Action {
    constructor(readonly prediction: Prediction<I, O>) {}
}

export class PredictError<I> implements Action {
    constructor(readonly input: I, readonly cause: Error) {}
}
