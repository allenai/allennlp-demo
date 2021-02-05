import { ModelCard } from '../tugboat/lib/ModelCard';
import { ModelInfo, ModelId } from './ModelInfo';

class NoModelCardIdError extends Error {
    constructor(info: ModelInfo) {
        super(`Unable to determine id to use for fetching a model card for model ${info.id}.`);
    }
}

/**
 * Returns the id that should be used when fetching a model's model card.
 *
 * AllenNLP's identifiers are currently in the process of being migrated to a new format, where
 * the ids include the task that a model was trained for.
 *
 * For some models the demo already has the new id, which is stored in the `pretrained_model_id`
 * field. For models that don't have that, we'll need a mapping like that shown below.
 *
 * See: https://github.com/allenai/allennlp-demo/issues/732
 */
export function getModelCardId(info: ModelInfo): string {
    // When this id exists, we can use it.
    if (info.pretrained_model_id) {
        return info.pretrained_model_id;
    }

    // Otherwise try to map the model to the identifier it should be using.
    switch (info.id) {
        case ModelId.NMN: {
            return 'rc-nmn';
        }
        case ModelId.VilbertVQA: {
            // The api/info is missing a pretrained_model_id for vqa
            return 've-vilbert';
        }
        default: {
            throw new NoModelCardIdError(info);
        }
    }
}

export type ModelCardsById = { [id: string]: ModelCard };
export function fetchModelCards(): Promise<ModelCardsById> {
    return fetch('/api/model-cards/').then((r) => r.json());
}
