import * as input from './Input';
import * as textArea from './TextArea';

export * from './controls';
export * from './Form';
export * from './Output';
export const Field = { ...textArea, ...input };
