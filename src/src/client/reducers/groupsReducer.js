import { fromJS, List } from 'immutable';
import { handleActions } from 'redux-actions';
import { CREATE_GROUP, DELETE_GROUP, FETCH_GROUPS, UNLOAD_GROUPS, UPDATE_GROUP } from 'actions/types';

const initialState = {
  groups: List([]),
};

const reducer = handleActions(
  {
    [FETCH_GROUPS.SUCCESS]: (state, action) => {
      const groups = fromJS(action.response.groups);
      return {
        ...state,
        groups: groups.sortBy((group) => group.get('name')),
      };
    },

    [CREATE_GROUP.SUCCESS]: (state, action) => {
      const resGroup = action.response.group;
      const withInsertedGroup = state.groups.push(fromJS(resGroup));

      return {
        ...state,
        groups: withInsertedGroup.sortBy((team) => team.get('name')),
      };
    },

    [UPDATE_GROUP.SUCCESS]: (state, action) => {
      const resGroup = action.response.group;
      const groupIndex = state.groups.findIndex((g) => {
        return g.get('_id') === resGroup._id;
      });
      return {
        ...state,
        groups: state.groups.set(groupIndex, fromJS(resGroup)),
      };
    },

    [DELETE_GROUP.SUCCESS]: (state, action) => {
      const idx = state.groups.findIndex((g) => {
        return g.get('_id') === action.payload._id;
      });
      return {
        ...state,
        groups: state.groups.delete(idx),
      };
    },

    [UNLOAD_GROUPS.SUCCESS]: (state) => {
      return {
        ...state,
        groups: state.groups.clear(),
      };
    },
  },
  initialState
);

export default reducer;
