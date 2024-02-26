import { createAction } from 'redux-actions';
import { CREATE_TEAM, DELETE_TEAM, FETCH_TEAMS, SAVE_EDIT_TEAM, UNLOAD_TEAMS } from 'actions/types';

export const fetchTeams = createAction(
  FETCH_TEAMS.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);
export const createTeam = createAction(CREATE_TEAM.ACTION);
export const saveEditTeam = createAction(SAVE_EDIT_TEAM.ACTION);
export const deleteTeam = createAction(DELETE_TEAM.ACTION);
export const unloadTeams = createAction(
  UNLOAD_TEAMS.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);
