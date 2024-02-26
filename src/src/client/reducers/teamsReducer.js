import { fromJS, List } from 'immutable';
import { handleActions } from 'redux-actions';
import { CREATE_TEAM, DELETE_TEAM, FETCH_TEAMS, SAVE_EDIT_TEAM, UNLOAD_TEAMS } from 'actions/types';

const initialState = {
  teams: List([]),
};

const reducer = handleActions(
  {
    [FETCH_TEAMS.SUCCESS]: (state, action) => {
      return {
        ...state,
        teams: fromJS(action.payload.response.teams),
      };
    },

    [CREATE_TEAM.SUCCESS]: (state, action) => {
      const resTeam = action.response.team;
      const withInsertedTeam = state.teams.push(fromJS(resTeam));
      return {
        ...state,
        teams: withInsertedTeam.sortBy((team) => team.get('name')),
      };
    },

    [SAVE_EDIT_TEAM.SUCCESS]: (state, action) => {
      const resTeam = action.response.team;
      const teamIndex = state.teams.findIndex((t) => {
        return t.get('_id') === resTeam._id;
      });
      return {
        ...state,
        teams: state.teams.set(teamIndex, fromJS(resTeam)),
      };
    },

    [DELETE_TEAM.SUCCESS]: (state, action) => {
      const idx = state.teams.findIndex((t) => {
        return t.get('_id') === action.payload._id;
      });
      return {
        ...state,
        teams: state.teams.delete(idx),
      };
    },

    [UNLOAD_TEAMS.SUCCESS]: (state) => {
      return {
        ...state,
        teams: state.teams.clear(),
      };
    },
  },
  initialState
);

export default reducer;
