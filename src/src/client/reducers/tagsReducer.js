import { fromJS, List } from 'immutable';
import { handleActions } from 'redux-actions';

import { GET_TAGS_WITH_PAGE, TAGS_UPDATE_CURRENT_PAGE } from 'actions/types';

const initialState = {
  loading: true,
  totalCount: 0,
  tags: List([]),
  currentPage: 0,
};

const tagsReducer = handleActions(
  {
    [GET_TAGS_WITH_PAGE.SUCCESS]: (state, action) => {
      return {
        ...state,
        loading: false,
        totalCount: action.response.count,
        tags: fromJS(action.response.tags),
      };
    },

    [GET_TAGS_WITH_PAGE.ERROR]: (state, action) => {
      return {
        ...state,
        loading: false,
      };
    },

    [TAGS_UPDATE_CURRENT_PAGE]: (state, action) => {
      return {
        ...state,
        currentPage: action.payload.currentPage,
      };
    },
  },
  initialState
);

export default tagsReducer;
