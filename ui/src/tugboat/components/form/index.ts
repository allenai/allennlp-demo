import * as document from './Document';
import * as hypothesis from './Hypothesis';
import * as passage from './Passage';
import * as premise from './Premise';
import * as question from './Question';
import * as sentence from './Sentence';

export * from './controls';
export * from './Form';
export * from './Output';
export const Field = {
    ...document,
    ...hypothesis,
    ...passage,
    ...premise,
    ...question,
    ...sentence,
};
