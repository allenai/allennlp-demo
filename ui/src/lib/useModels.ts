import { useReducer, useEffect } from 'react';

import * as models from './store/models';

/**
 * Provides access to the provided list of models, their metadata and an API for invoking
 * them for demonstration purposes.
 *
 * Calling this method kicks off a series of requests for the metadata associated with each
 * of the provided model ids.
 */
export function useModels<I, O>(...modelIds: string[]): models.Store<I, O> {
    const [currentState, dispatch] = useReducer(
        models.Store.reducer,
        new models.state.Loading(modelIds)
    );

    const store = new models.Store<I, O>(currentState, dispatch);

    useEffect(() => {
        store.loadModels(modelIds);
    }, modelIds);

    return store;
}
