import { call, put, takeLatest } from 'redux-saga/effects';
import { CREATE_GROUP, DELETE_GROUP, FETCH_GROUPS, HIDE_MODAL, UNLOAD_GROUPS, UPDATE_GROUP } from 'actions/types';

import api from '../../api';
import Log from '../../logger';
import helpers from 'lib/helpers';

function* fetchGroups({ payload }) {
  try {
    const response = yield call(api.groups.get, payload);
    yield put({ type: FETCH_GROUPS.SUCCESS, response });
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error;
    helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    yield put({ type: FETCH_GROUPS.ERROR, error });
    Log.error(errorText, error);
  }
}

function* createGroup({ payload }) {
  try {
    const response = yield call(api.groups.create, payload);
    yield put({ type: CREATE_GROUP.SUCCESS, response });
    yield put({ type: HIDE_MODAL.ACTION });
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error;
    helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    yield put({ type: CREATE_GROUP.ERROR, error });
    Log.error(errorText, error);
  }
}

function* updateGroup({ payload }) {
  try {
    const response = yield call(api.groups.update, payload);
    yield put({ type: UPDATE_GROUP.SUCCESS, response });
    yield put({ type: HIDE_MODAL.ACTION });
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error;
    helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    yield put({ type: UPDATE_GROUP.ERROR, error });
    Log.error(errorText, error);
  }
}

function* deleteGroup({ payload, meta }) {
  try {
    const response = yield call(api.groups.delete, payload);
    yield put({ type: DELETE_GROUP.SUCCESS, payload, response, meta });
    helpers.UI.showSnackbar('Successfully delete group');
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error;
    helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    yield put({ type: DELETE_GROUP.ERROR, error });
    Log.error(errorText, error);
  }
}

function* unloadThunk({ payload, meta }) {
  try {
    yield put({ type: UNLOAD_GROUPS.SUCCESS, payload, meta });
  } catch (error) {
    Log.error(error);
  }
}

export default function* watcher() {
  yield takeLatest(FETCH_GROUPS.ACTION, fetchGroups);
  yield takeLatest(CREATE_GROUP.ACTION, createGroup);
  yield takeLatest(UPDATE_GROUP.ACTION, updateGroup);
  yield takeLatest(DELETE_GROUP.ACTION, deleteGroup);
  yield takeLatest(UNLOAD_GROUPS.ACTION, unloadThunk);
}
