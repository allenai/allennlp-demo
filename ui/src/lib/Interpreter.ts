export enum InterpreterId {
    SimpleGradient = 'simple_gradient',
    IntegratedGradient = 'integrated_gradient',
    SmoothGradient = 'smooth_gradient',
}

export interface GradInput {
    grad_input_1: number[];
}

export interface DoubleGradInput extends GradInput {
    grad_input_2: number[];
}

export interface InterpreterData<T extends GradInput | DoubleGradInput> {
    instance_1: T;
}

export const isInterpreterData = (
    pred: InterpreterData<GradInput>
): pred is InterpreterData<GradInput> => {
    return pred.instance_1 !== undefined && pred.instance_1.grad_input_1 !== undefined;
};

export const isDoubleInterpreterData = (
    pred: InterpreterData<DoubleGradInput>
): pred is InterpreterData<DoubleGradInput> => {
    return isInterpreterData(pred) && pred.instance_1.grad_input_2 !== undefined;
};
