import { ModelCard } from './ModelCard';

export interface ModelInfo {
    id: string;
    model_card_data?: ModelCard;
}

export async function fetchModelInfo(id: string): Promise<ModelInfo> {
    const resp = await fetch(`/api/${id}`);
    const inf: ModelInfo = await resp.json();
    return inf;
}
