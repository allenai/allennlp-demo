export enum ModelId {
    Bidaf = 'bidaf',
    BidafELMO = 'bidaf-elmo',
    ELMONER = 'named-entity-recognition',
    FineGrainedNER = 'fine-grained-ner',
    Naqanet = 'naqanet',
    NMN = 'nmn',
    OpenIE = 'open-information-extraction',
    TransformerQA = 'transformer-qa',
}

/**
 * Hitting `/api/info` returns a list of these.
 */
export interface ModelEndpoint {
    id: string;
    commit_sha: string;
    commit_url: string;
    url: string;
    info: ModelInfo;
}

/**
 * Details about an individual model. Hitting `/api/:modelId/` directly returns one of these.
 */
export interface ModelInfo {
    allennlp: string;
    archive_file: string;
    attackers: string[];
    id: ModelId;
    interpreters: string[];
    overrides?: { [k: string]: any };
    predictor_name: string;
    pretrained_model_id?: string;
    use_old_load_method: boolean;
}

/**
 * Query the details for a set of models, or for all models.
 *
 * If ids is set, only information for the specified models will be returned. If unset, information
 * for all models will be returned.
 */
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
