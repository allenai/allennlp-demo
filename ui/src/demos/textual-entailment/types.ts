import { emory } from '../../tugboat/lib';

export const Version = emory.getVersion('te-v1');

export interface Input {
    premise: string;
    hypothesis: string;
}

export interface Prediction {}
