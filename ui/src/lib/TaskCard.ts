import { Example, GroupedExamples } from '@allenai/tugboat/lib';

export interface TaskCard {
    id: string;
    name?: string;
    description?: string;
    expected_inputs?: string;
    expected_outputs?: string;
    scope_and_limitations?: string;
    examples: Example[] | GroupedExamples;
}

export type TaskCardsById = { [taskId: string]: TaskCard };

export function fetchTaskCards(): Promise<TaskCardsById> {
    return fetch(`/api/tasks/`).then((r) => r.json());
}
