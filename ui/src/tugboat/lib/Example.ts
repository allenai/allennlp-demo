export interface Example {
    [fieldName: string]: string;
}

export interface GroupedExamples {
    [groupName: string]: Example[];
}

export function isGroupedExamples(
    examples: Example[] | GroupedExamples
): examples is GroupedExamples {
    if (Array.isArray(examples)) {
        return false;
    }
    return true;
}

export class UngroupedExamplesError extends Error {
    constructor() {
        super(`The examples aren't grouped but are expected to be.`);
    }
}

export class GroupedExamplesError extends Error {
    constructor() {
        super(`The examples are grouped but are expected not to be.`);
    }
}
