import { emory } from '../../tugboat/lib';

export const Version = emory.getVersion('sa-v1');

export interface Input {
    input: string; // TODO: rename?
}

export interface Prediction {}
