// TODO: Some of these fields are probably AllenNLP specific, the `registered_*` ones are
// particularly suspect. We should figure out what to remove when we lift this into it's
// own package.
export interface ModelCard {
    archive_file?: string;
    citation?: string;
    contact?: string;
    contributed_by?: string;
    date?: string;
    description: string;
    developed_by?: string;
    display_name: string;
    evaluation_dataset?: string;
    model_performance_measures?: string;
    model_type?: string;
    paper?: string;
    registered_model_name?: string;
    registered_predictor_name?: string;
    short_description?: string;
    task_id?: string;
    training_dataset?: string;
    training_motivation?: string;
    training_preprocessing?: string;
    version?: string;
}
