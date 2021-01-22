import * as document from './Document';
import * as passage from './Passage';
import * as question from './Question';
import * as sentence from './Sentence';

export * from './controls';
export * from './Form';
export * from './Output';
export const Field = { ...passage, ...question, ...sentence, ...document };
