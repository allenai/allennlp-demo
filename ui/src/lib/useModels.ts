import { useReducer, useEffect } from 'react';

import { Model } from './Model';
import { fetchModelInfo } from './ModelInfo';
import * as models from './store/models';

interface ModelStoreAdapter<I, O> {
    store: models.Store<I, O>;
    selectModelById: (modelId: string) => void;
    fetchPredictionsUsingSelectedModel: (input: I) => void;
}

export function useModels<I, O>(...modelIds: string[]): ModelStoreAdapter<I, O> {
    const [store, dispatch] = useReducer(
        models.Store.reducer,
        new models.Store<I, O>(new models.state.Loading(modelIds))
    );

    useEffect(() => {
        Promise.all(modelIds.map(fetchModelInfo)).then((info) => {
            dispatch(
                new models.action.Loaded(
                    modelIds,
                    info.map((i) => new Model(i))
                )
            );
        });
    }, modelIds);

    const selectModelById = (id: string) => {
        dispatch(new models.action.Select(id));
    };

    const fetchPredictionsUsingSelectedModel = (i: I) => {
        if (!(store.current instanceof models.state.Loaded)) {
            throw new models.error.InvalidState(store.current);
        }
        dispatch(new models.action.Predicting(i));
        store.current.selected
            .predict(i)
            .then((p) => {
                dispatch(new models.action.ReceivedPrediction(p));
            })
            .catch((e) => {
                const err = e instanceof Error ? e : new Error(e);
                dispatch(new models.action.PredictError(i, err));
            });
    };

    return {
        // TODO: Something about the `useReducer()` type causes type erasure, and `store` becomes
        // `store.Store<unknown, unknown>`. This resolves that, but it'd be nice to avoid the
        // cast we can find a way to do so.
        store: (store as unknown) as models.Store<I, O>,
        selectModelById,
        fetchPredictionsUsingSelectedModel,
    };
}
