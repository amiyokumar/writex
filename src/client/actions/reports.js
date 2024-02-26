import { createAction } from 'redux-actions';
import { GENERATE_REPORT } from 'actions/types';

export const generateReport = createAction(
  GENERATE_REPORT.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);
