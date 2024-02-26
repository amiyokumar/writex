/*
   
 *  
 *  Copyright (c) 2014-2022. Trudesk Inc (Chris Brame) All rights reserved.
 */

import { call, put, takeLatest } from 'redux-saga/effects';

import api from '../../api';
import {
  FETCH_DASHBOARD_DATA,
  FETCH_DASHBOARD_OVERDUE_TICKETS,
  FETCH_DASHBOARD_TOP_GROUPS,
  FETCH_DASHBOARD_TOP_TAGS,
} from 'actions/types';

import Log from '../../logger';
import helpers from 'lib/helpers';

function* fetchDashboardData({ payload, meta }) {
  yield put({ type: FETCH_DASHBOARD_DATA.PENDING });
  try {
    const response = yield call(api.dashboard.getData, payload);
    yield put({ type: FETCH_DASHBOARD_DATA.SUCCESS, response, meta });
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error;
    if (error.response && error.response.status !== (401 || 403)) {
      Log.error(errorText, error);
      helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    }

    yield put({ type: FETCH_DASHBOARD_DATA.ERROR, error });
  }
}

function* fetchDashboardTopGroups({ payload }) {
  yield put({ type: FETCH_DASHBOARD_TOP_GROUPS.PENDING });
  try {
    const response = yield call(api.dashboard.getTopGroups, payload);
    yield put({ type: FETCH_DASHBOARD_TOP_GROUPS.SUCCESS, response });
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error;
    if (error.response && error.response.status !== (401 || 403)) {
      Log.error(errorText, error);
      helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    }

    yield put({ type: FETCH_DASHBOARD_TOP_GROUPS.ERROR, error });
  }
}

function* fetchDashboardTopTags({ payload }) {
  yield put({ type: FETCH_DASHBOARD_TOP_TAGS.PENDING });
  try {
    const response = yield call(api.dashboard.getTopTags, payload);
    yield put({ type: FETCH_DASHBOARD_TOP_TAGS.SUCCESS, response });
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error;
    if (error.response && error.response.status !== (401 || 403)) {
      Log.error(errorText, error);
      helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    }

    yield put({ type: FETCH_DASHBOARD_TOP_TAGS.ERROR, error });
  }
}

function* fetchDashboardOverdueTickets({ payload }) {
  yield put({ type: FETCH_DASHBOARD_OVERDUE_TICKETS.PENDING });
  try {
    const response = yield call(api.dashboard.getOverdueTickets, payload);
    yield put({ type: FETCH_DASHBOARD_OVERDUE_TICKETS.SUCCESS, response });
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error;
    if (error.response && error.response.status !== (401 || 403)) {
      Log.error(errorText, error);
      helpers.UI.showSnackbar(`Error: ${errorText}`, true);
    }

    yield put({ type: FETCH_DASHBOARD_OVERDUE_TICKETS.ERROR, error });
  }
}

export default function* watcher() {
  yield takeLatest(FETCH_DASHBOARD_DATA.ACTION, fetchDashboardData);
  yield takeLatest(FETCH_DASHBOARD_TOP_GROUPS.ACTION, fetchDashboardTopGroups);
  yield takeLatest(FETCH_DASHBOARD_TOP_TAGS.ACTION, fetchDashboardTopTags);
  yield takeLatest(FETCH_DASHBOARD_OVERDUE_TICKETS.ACTION, fetchDashboardOverdueTickets);
}
