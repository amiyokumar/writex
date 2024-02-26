import { call, put, takeLatest } from 'redux-saga/effects';
import { FETCH_SEARCH_RESULTS, UNLOAD_SEARCH_RESULTS } from 'actions/types';

import api from '../../api';
import Log from '../../logger';
import helpers from 'lib/helpers';

function* fetchSearchResults({ payload, meta }) {
  yield put({ type: FETCH_SEARCH_RESULTS.PENDING });
  if (!payload.term) yield put({ type: FETCH_SEARCH_RESULTS.ERROR, error: { message: 'Invalid search Term' } });
  try {
    const response = yield call(api.search.search, payload);
    yield put({ type: FETCH_SEARCH_RESULTS.SUCCESS, response, meta });
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error;
    helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    yield put({ type: FETCH_SEARCH_RESULTS.ERROR, error });
    Log.error(errorText, error);
  }
}

function* unloadSearchResults({ payload, meta }) {
  yield put({ type: UNLOAD_SEARCH_RESULTS.SUCCESS, payload, meta });
}

export default function* watcher() {
  yield takeLatest(FETCH_SEARCH_RESULTS.ACTION, fetchSearchResults);
  yield takeLatest(UNLOAD_SEARCH_RESULTS.ACTION, unloadSearchResults);
}
