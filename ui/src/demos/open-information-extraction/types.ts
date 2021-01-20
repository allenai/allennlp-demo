import { emory } from '../../tugboat/lib';

export const Version = emory.getVersion('oie-v1');

export interface Input {
    sentence: string;
}

export interface VerbData {
    description: string;
    tags: string[];
    verb: string;
}

export interface Prediction {
    verbs: VerbData[];
    words: string[];
}
