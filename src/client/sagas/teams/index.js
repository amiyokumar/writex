import { call, put, takeLatest } from 'redux-saga/effects';
import { CREATE_TEAM, DELETE_TEAM, FETCH_TEAMS, HIDE_MODAL, SAVE_EDIT_TEAM, UNLOAD_TEAMS } from 'actions/types';

import Log from '../../logger';
import api from '../../api';
import helpers from 'lib/helpers';

function* fetchTeams({ payload, meta }) {
  try {
    const response = yield call(api.teams.getWithPage, payload);
    yield put({ type: FETCH_TEAMS.SUCCESS, payload: { response, payload }, meta });
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error;
    helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    Log.error(errorText, error);
    yield put({ type: FETCH_TEAMS.ERROR, error });
  }
}

function* createTeam({ payload }) {
  try {
    const response = yield call(api.teams.create, payload);
    yield put({ type: CREATE_TEAM.SUCCESS, response });
    yield put({ type: HIDE_MODAL.ACTION });
  } catch (error) {
    const errorText = error.response.data.error;
    helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    yield put({ type: CREATE_TEAM.ERROR, error });
  }
}

function* updateTeam({ payload }) {
  try {
    const response = yield call(api.teams.updateTeam, payload);
    yield put({ type: SAVE_EDIT_TEAM.SUCCESS, response });
    yield put({ type: HIDE_MODAL.ACTION });
  } catch (error) {
    const errorText = error.response.data.error;
    helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    yield put({ type: SAVE_EDIT_TEAM.ERROR, error });
  }
}

function* deleteTeam({ payload }) {
  try {
    const response = yield call(api.teams.deleteTeam, payload);
    yield put({ type: DELETE_TEAM.SUCCESS, payload, response });
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error;
    helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    Log.error(errorText, error);
    yield put({ type: DELETE_TEAM.ERROR, error });
  }
}

function* unloadThunk({ payload, meta }) {
  try {
    yield put({ type: UNLOAD_TEAMS.SUCCESS, payload, meta });
  } catch (error) {
    Log.error(error);
  }
}

export default function* watcher() {
  yield takeLatest(FETCH_TEAMS.ACTION, fetchTeams);
  yield takeLatest(CREATE_TEAM.ACTION, createTeam);
  yield takeLatest(SAVE_EDIT_TEAM.ACTION, updateTeam);
  yield takeLatest(DELETE_TEAM.ACTION, deleteTeam);
  yield takeLatest(UNLOAD_TEAMS.ACTION, unloadThunk);
}
