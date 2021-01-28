import { emory } from '../../tugboat/lib';

export const Version = emory.getVersion('vqa-v1');

export interface Input {
    image: {
        imageSrc: string;
        fileName: string;
        image: File;
        image_base64: string;
    };
    question: string;
}

export interface Answer {
    answer: string;
    confidence: number;
}

export type Prediction = Answer[];
