export enum ModelId {
    Bidaf = 'bidaf',
    BidafELMO = 'bidaf-elmo',
    ELMONER = 'named-entity-recognition',
    FineGrainedNER = 'fine-grained-ner',
    Naqanet = 'naqanet',
    NMN = 'nmn',
    OpenIE = 'open-information-extraction',
    TransformerQA = 'transformer-qa',
    SemanticRollLabeling = 'semantic-role-labeling',
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
 * Fetch information about all of the models.
 */
export function fetchModelInfo(): Promise<ModelInfo[]> {
    return fetch('/api/info')
        .then((r) => r.json())
        .then((endpoints: ModelEndpoint[]) => {
            return endpoints.map((e) => e.info);
        });
}
