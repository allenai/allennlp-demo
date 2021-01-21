import { emory } from '../../tugboat/lib';

export const Version = emory.getVersion('cr-v1');

export interface Input {
    document: string;
}

export interface Prediction {}
