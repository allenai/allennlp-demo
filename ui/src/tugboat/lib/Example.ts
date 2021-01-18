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
