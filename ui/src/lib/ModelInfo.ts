import { ModelCard } from '../tugboat/lib/ModelCard';

export interface ModelEndpoint {
    id: string;
    commit_sha: string;
    commit_url: string;
    url: string;
    info: ModelInfo;
}

export interface ModelInfo {
    allennlp: string;
    archive_file: string;
    attackers: string[];
    id: string;
    interpreters: string[];
    model_card_data?: ModelCard;
    overrides?: { [k: string]: any };
    predictor_name: string;
    pretrained_model_id: string;
    use_old_load_method: boolean;
}

export function fetchModelInfo(ids?: string[]): Promise<ModelInfo[]> {
    const includeIds = new Set(ids || []);
    return fetch('/api/info')
        .then((r) => r.json())
        .then((endpoints: ModelEndpoint[]) => {
            const info = endpoints.map((e) => e.info);
            if (includeIds.size === 0) {
                return info;
            }
            return info.filter((i) => includeIds.has(i.id));
        });
}
