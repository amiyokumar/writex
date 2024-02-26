import { createAction } from 'redux-actions';
import { FETCH_SEARCH_RESULTS, UNLOAD_SEARCH_RESULTS } from 'actions/types';

export const fetchSearchResults = createAction(
  FETCH_SEARCH_RESULTS.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);
export const unloadSearchResults = createAction(
  UNLOAD_SEARCH_RESULTS.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);
