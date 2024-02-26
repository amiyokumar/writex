import { createAction } from 'redux-actions';
import {
  INIT_SOCKET,
  UPDATE_SOCKET,
  SET_SESSION_USER,
  SHOW_MODAL,
  HIDE_MODAL,
  CLEAR_MODAL,
  FETCH_ROLES,
  UPDATE_ROLE_ORDER,
  FETCH_VIEWDATA,
  SHOW_NOTICE,
  CLEAR_NOTICE,
} from 'actions/types';

export const initSocket = createAction(
  INIT_SOCKET.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);
export const updateSocket = createAction(UPDATE_SOCKET.ACTION, (payload) => payload);

export const setSessionUser = createAction(SET_SESSION_USER.ACTION);

export const showModal = createAction(SHOW_MODAL.ACTION, (modalType, modalProps) => ({ modalType, modalProps }));
export const hideModal = createAction(HIDE_MODAL.ACTION);
export const clearModal = createAction(CLEAR_MODAL.ACTION);

export const showNotice = createAction(SHOW_NOTICE.ACTION);
export const clearNotice = createAction(CLEAR_NOTICE.ACTION);

export const fetchRoles = createAction(FETCH_ROLES.ACTION);
export const updateRoleOrder = createAction(UPDATE_ROLE_ORDER.ACTION);

export const fetchViewData = createAction(
  FETCH_VIEWDATA.ACTION,
  (payload) => payload,
  () => ({ thunk: true })
);
