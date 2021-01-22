import { emory } from '../../tugboat/lib';

export const Version = emory.getVersion('vqa-v1');

export interface Input {
    image: any; // TODO: we need to port an image input type
    question: string;
}

export interface Prediction {}
