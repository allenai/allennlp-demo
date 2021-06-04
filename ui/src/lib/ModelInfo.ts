export enum ModelId {
    Bidaf = 'bidaf',
    BidafELMO = 'bidaf-elmo',
    ConstituencyParser = 'constituency-parser',
    CoreferenceResolution = 'coreference-resolution',
    DependencyParser = 'dependency-parser',
    ELMONER = 'named-entity-recognition',
    ELMOSNLI = 'elmo-snli',
    FineGrainedNER = 'fine-grained-ner',
    GloveSentimentAnalysis = 'glove-sentiment-analysis',
    LERC = 'lerc',
    MaskedLM = 'masked-lm',
    Naqanet = 'naqanet',
    NextTokenLM = 'next-token-lm',
    NMN = 'nmn',
    OpenIE = 'open-information-extraction',
    RobertaMNLI = 'roberta-mnli',
    RobertaSentimentAnalysis = 'roberta-sentiment-analysis',
    RobertaSNLI = 'roberta-snli',
    SemanticRollLabeling = 'semantic-role-labeling',
    TransformerQA = 'transformer-qa',
    VilbertVQA = 'vilbert-vqa',
    BinaryGenderBiasMitigatedRobertaSNLI = 'binary-gender-bias-mitigated-roberta-snli'
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
 * Fetch information for a specific model.
 */
export function fetchModelInfo(modelId: string): Promise<ModelInfo> {
    return fetch(`/api/${modelId}`).then((r) => r.json());
}
