import { Model } from '../../Model';
import { Prediction } from '../../Prediction';

export interface State {}
export class Loading implements State {
    constructor(readonly modelIds: string[]) {}
}
export class Loaded<I, O> implements State {
    constructor(readonly models: Model<I, O>[], readonly selected: Model<I, O>) {}
}
export class FailedToLoad implements State {
    constructor(readonly modelIds: string[], readonly cause: Error) {}
}
export class Predicting<I, O> extends Loaded<I, O> {
    constructor(readonly models: Model<I, O>[], readonly selected: Model<I, O>, readonly input: I) {
        super(models, selected);
    }
}
export class HasPrediction<I, O> extends Loaded<I, O> {
    constructor(
        readonly models: Model<I, O>[],
        readonly selected: Model<I, O>,
        readonly prediction: Prediction<I, O>
    ) {
        super(models, selected);
    }
}
export class FailedToPredict<I, O> extends Loaded<I, O> {
    constructor(
        readonly models: Model<I, O>[],
        readonly selected: Model<I, O>,
        readonly input: I,
        readonly cause: Error
    ) {
        super(models, selected);
    }
}
