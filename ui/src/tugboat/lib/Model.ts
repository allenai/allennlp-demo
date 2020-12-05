import { ModelCard } from './ModelCard';

export class Model {
    constructor(
        readonly id: string,
        readonly card: ModelCard
    ) {}
}
