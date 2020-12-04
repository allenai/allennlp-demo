import { ModelCard } from './ModelCard';

export interface ModelInfo {
    id: string;
    model_card_data?: ModelCard;
}

export function fetchModelInfo(id: string): Promise<ModelInfo> {
    return fetch(`/api/${id}`).then((r) => r.json());
}
