import { fromJS, List } from 'immutable';
import { handleActions } from 'redux-actions';
import { FETCH_SEARCH_RESULTS, UNLOAD_SEARCH_RESULTS } from 'actions/types';

const initialState = {
  loading: false,
  results: List([]),
  error: null,
};

const searchReducer = handleActions(
  {
    [FETCH_SEARCH_RESULTS.PENDING]: (state) => {
      return {
        ...state,
        loading: true,
      };
    },

    [FETCH_SEARCH_RESULTS.SUCCESS]: (state, action) => {
      return {
        ...state,
        loading: false,
        results: fromJS(action.response.hits.hits),
      };
    },

    [FETCH_SEARCH_RESULTS.ERROR]: (state, action) => {
      return {
        ...state,
        loading: false,
        error: action.error.response.data,
      };
    },

    [UNLOAD_SEARCH_RESULTS.SUCCESS]: (state) => {
      return {
        ...state,
        loading: false,
        results: state.results.clear(),
      };
    },
  },
  initialState
);

export default searchReducer;
