import { createAction } from 'redux-actions';
import {
  CREATE_DEPARTMENT,
  DELETE_DEPARTMENT,
  FETCH_DEPARTMENTS,
  UNLOAD_DEPARTMENTS,
  UPDATE_DEPARTMENT,
} from 'actions/types';

export const fetchDepartments = createAction(
  FETCH_DEPARTMENTS.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);
export const createDepartment = createAction(CREATE_DEPARTMENT.ACTION);
export const updateDepartment = createAction(UPDATE_DEPARTMENT.ACTION);
export const deleteDepartment = createAction(DELETE_DEPARTMENT.ACTION);
export const unloadDepartments = createAction(
  UNLOAD_DEPARTMENTS.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);
