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

export function flattenExamples(examples: GroupedExamples | Example[]): Example[] {
    if (!isGroupedExamples(examples)) {
        return examples;
    }
    let all: Example[] = [];
    for (const group of Object.keys(examples)) {
        all = all.concat(examples[group]);
    }
    return all;
}
