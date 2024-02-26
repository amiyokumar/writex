import { createAction } from 'redux-actions';
import { CREATE_GROUP, DELETE_GROUP, FETCH_GROUPS, UNLOAD_GROUPS, UPDATE_GROUP } from 'actions/types';

export const fetchGroups = createAction(
  FETCH_GROUPS.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);
export const createGroup = createAction(CREATE_GROUP.ACTION);
export const updateGroup = createAction(UPDATE_GROUP.ACTION);
export const deleteGroup = createAction(
  DELETE_GROUP.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);
export const unloadGroups = createAction(
  UNLOAD_GROUPS.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);
