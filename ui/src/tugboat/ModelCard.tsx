/**
 * TODO: This code is tightly coupled to the AllenNLP Demo and should be moved out of
 * `tugboat`:
 *
 *  1. The API endpoints we query are AllenNLP specific. We can't assert that `/api/info` or
 *     `/api/:model` exists in the backend we're talking to. We only know this to be true
 *     in this example.
 *
 *  2. The `ModelCard` includes all sorts of properties that are domain specific -- AllenNLP
 *     models have properties like `registered_predictor_name` that won't exist in Vision,
 *     Mosaic, etc. I like the idea of asserting some general set of properties that models
 *     need to have to be featured via `tugboat`, but that's probably a pretty small, generic
 *     set.
 */
import React from 'react';

export interface ModelCard {
    id: string;
    archive_file?: string;
    citation?: string;
    contact?: string;
    contributed_by?: string;
    date?: string;
    description: string;
    developed_by?: string;
    display_name: string;
    evaluation_dataset?: string;
    model_type?: string;
    paper?: string;
    registered_model_name?: string;
    registered_predictor_name?: string;
    task_id?: string;
    training_dataset?: string;
    training_motivation?: string;
    training_preprocessing?: string;
    version?: string;
}

export interface ModelInfo {
    id: string;
    model_card_data?: ModelCard;
}

export function fetchModelInfo(id: string): Promise<ModelInfo> {
    return fetch(`/api/${id}`).then((r) => r.json() as Promise<ModelInfo>);
}

export function useModels(...ids: string[]): ModelInfo[] | undefined {
    const [models, setModels] = React.useState<ModelInfo[]>();
    React.useEffect(() => {
        Promise.all(ids.map(fetchModelInfo)).then(setModels);
    }, ids);
    return models;
}
