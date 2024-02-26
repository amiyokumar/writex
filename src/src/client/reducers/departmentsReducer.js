import { fromJS, List } from 'immutable';
import { handleActions } from 'redux-actions';
import {
  CREATE_DEPARTMENT,
  DELETE_DEPARTMENT,
  FETCH_DEPARTMENTS,
  UNLOAD_DEPARTMENTS,
  UPDATE_DEPARTMENT,
} from 'actions/types';

const initialState = {
  departments: List([]),
};

const reducer = handleActions(
  {
    [FETCH_DEPARTMENTS.SUCCESS]: (state, action) => {
      const departmentList = fromJS(action.response.departments);
      return {
        ...state,
        departments: departmentList.sortBy((d) => d.get('normalized')),
      };
    },

    [CREATE_DEPARTMENT.SUCCESS]: (state, action) => {
      const department = fromJS(action.response.department);
      const withDepartment = state.departments.push(department);
      return {
        ...state,
        departments: withDepartment.sortBy((department) => department.get('normalized')),
      };
    },

    [UPDATE_DEPARTMENT.SUCCESS]: (state, action) => {
      const department = action.response.department;
      const idx = state.departments.findIndex((d) => {
        return d.get('_id') === department._id;
      });

      return {
        ...state,
        departments: state.departments.set(idx, fromJS(department)),
      };
    },

    [DELETE_DEPARTMENT.SUCCESS]: (state, action) => {
      const idx = state.departments.findIndex((d) => {
        return d.get('_id') === action.payload._id;
      });
      return {
        ...state,
        departments: state.departments.delete(idx),
      };
    },

    [UNLOAD_DEPARTMENTS.SUCCESS]: (state) => {
      return {
        ...state,
        departments: state.departments.clear(),
      };
    },
  },
  initialState
);

export default reducer;
