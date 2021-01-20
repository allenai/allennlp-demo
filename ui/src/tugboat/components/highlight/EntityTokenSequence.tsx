import { InvalidTokenSequenceError } from '../../error';

enum TokenSequence {
    B = 'B', // "Beginning" (first token in a sequence of tokens comprising an entity)
    I = 'I', // "Inside" (token in a sequence of tokens (that isn't first or last in its sequence) comprising an entity)
    L = 'L', // "Last" (last token in a sequence of tokens comprising an entity)
    O = 'O', // "Outside" (token that isn't associated with any entities)
    U = 'U', // "Unit" (A single token representing a single entity)
}

export interface FormattedToken {
    text: string;
    entity?: string;
}

export const formatTokens = (tags: string[], words: string[]) => {
    // if we have an open token, then close it (used when we hit a non TokenSequence.I)
    const closeAnyOpenToken = (lastWord?: string) => {
        if (tokenObj) {
            // If we have a current word, append current word to span.
            tokenObj.text += lastWord || '';
            // Append array of formatted token objects with this token object.
            formattedTokens.push(tokenObj);
            tokenObj = undefined;
        }
    };

    // An empty array for building a list of formatted token objects.
    const formattedTokens: FormattedToken[] = [];

    // An empty object to store temporary token data.
    let tokenObj: FormattedToken | undefined;

    // Iterate through array of tags from response data.
    tags.forEach((tag, i) => {
        if (tag === TokenSequence.O) {
            // If this tag is not part of an entity:
            closeAnyOpenToken();
            // Append array of formatted token objects with this token object.
            formattedTokens.push({
                text: words[i],
            });
        } else if (tag[0] === TokenSequence.U) {
            // If this tag is a unit token:
            closeAnyOpenToken();
            // Append array of formatted token objects with this token object.
            formattedTokens.push({
                text: words[i],
                entity: tag.slice(2), // tag value with "U-" stripped from the beginning
            });
        } else if (tag[0] === TokenSequence.B) {
            // If this tag is beginning of a span:
            closeAnyOpenToken();
            // Reset span string to current token's word.
            tokenObj = {
                text: words[i],
                entity: tag.slice(2), // tag value with "B-" stripped from the beginning
            };
        } else if (tag[0] === TokenSequence.I) {
            // If this tag is inside a span:
            // Append current word to span string w/ space at beginning.
            if (tokenObj) {
                tokenObj.text += `${' '}${words[i]}`;
            } else {
                throw new InvalidTokenSequenceError('"I" can only appear after a "B" or an "I"');
            }
        } else if (tag[0] === TokenSequence.L) {
            // If this tag is last in a span:
            closeAnyOpenToken(`${' '}${words[i]}`);
        }
    });
    closeAnyOpenToken();

    return formattedTokens;
};
