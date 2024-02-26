import { handleActions } from 'redux-actions';
import { fromJS, List, Map } from 'immutable';

import { FETCH_VIEWDATA } from 'actions/types';

const initialState = {
  loadingViewData: true,
  viewdata: Map({}),
};

const commonReducer = handleActions(
  {
    [FETCH_VIEWDATA.PENDING]: (state) => {
      return {
        ...state,
        loadingViewData: true,
      };
    },

    [FETCH_VIEWDATA.SUCCESS]: (state, action) => {
      return {
        ...state,
        loadingViewData: false,
        viewdata: fromJS(action.payload.response.viewdata),
      };
    },
    [FETCH_VIEWDATA.ERROR]: (state) => {
      return {
        ...state,
        loadingViewData: true,
        viewdata: initialState.viewdata,
      };
    },
  },

  initialState
);

export default commonReducer;
