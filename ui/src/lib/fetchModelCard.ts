import { ModelCard } from '../tugboat/lib/ModelCard';

export function fetchModelCard(id: string): Promise<ModelCard> {
    return fetch(`/api/model-card/${id}`).then((r) => r.json());
}
