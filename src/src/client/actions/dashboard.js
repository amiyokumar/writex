/*
   
 *  
 *  Copyright (c) 2014-2022. Trudesk Inc (Chris Brame) All rights reserved.
 */

import { createAction } from 'redux-actions';
import {
  FETCH_DASHBOARD_DATA,
  FETCH_DASHBOARD_TOP_GROUPS,
  FETCH_DASHBOARD_TOP_TAGS,
  FETCH_DASHBOARD_OVERDUE_TICKETS,
} from 'actions/types';

export const fetchDashboardData = createAction(
  FETCH_DASHBOARD_DATA.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);

export const fetchDashboardTopGroups = createAction(FETCH_DASHBOARD_TOP_GROUPS.ACTION, (payload) => payload);
export const fetchDashboardTopTags = createAction(FETCH_DASHBOARD_TOP_TAGS.ACTION, (payload) => payload);
export const fetchDashboardOverdueTickets = createAction(FETCH_DASHBOARD_OVERDUE_TICKETS.ACTION);
