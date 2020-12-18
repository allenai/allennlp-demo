import { Example, GroupedExamples } from './Example';

/**
 * A task is something we ask an AI model to accomplish, as to evaluate it's capabilities
 * according to criteria inherent in the exercise.
 */
export interface Task {
    id: string;
    name: string;
    description: string;
    expected_inputs?: string;
    expected_outputs?: string;
    scope_and_limitations?: string;
    examples: Example[] | GroupedExamples;
}
