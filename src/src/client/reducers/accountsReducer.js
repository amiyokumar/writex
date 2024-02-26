import { fromJS, List } from 'immutable';
import { handleActions } from 'redux-actions';
import {
  CREATE_ACCOUNT,
  DELETE_ACCOUNT,
  ENABLE_ACCOUNT,
  FETCH_ACCOUNTS,
  FETCH_ACCOUNTS_CREATE_TICKET,
  SAVE_EDIT_ACCOUNT,
  UNLOAD_ACCOUNTS,
} from 'actions/types';

const initialState = {
  accounts: List([]),
  type: 'customers',
  loading: false,

  accountsCreateTicket: List([]),
  createTicketLoading: false,
};

const reducer = handleActions(
  {
    [FETCH_ACCOUNTS.PENDING]: (state) => {
      return {
        ...state,
        loading: true,
      };
    },

    [FETCH_ACCOUNTS.SUCCESS]: (state, action) => {
      const arr = state.accounts.toArray();
      action.payload.response.accounts.forEach((i) => {
        arr.push(i);
      });
      return {
        ...state,
        accounts: fromJS(arr),
        type: action.payload.payload && action.payload.payload.type ? action.payload.payload.type : 'customers',
        loading: false,
      };
    },

    [FETCH_ACCOUNTS_CREATE_TICKET.PENDING]: (state) => {
      return {
        ...state,
        createTicketLoading: true,
      };
    },

    [FETCH_ACCOUNTS_CREATE_TICKET.SUCCESS]: (state, action) => {
      const arr = state.accountsCreateTicket.toArray();
      action.payload.response.accounts.forEach((i) => {
        arr.push(i);
      });
      return {
        ...state,
        accountsCreateTicket: fromJS(arr),
        createTicketLoading: false,
      };
    },

    [CREATE_ACCOUNT.SUCCESS]: (state, action) => {
      const resAccount = action.response.account;

      if (!resAccount.role.isAgent && !resAccount.role.isAdmin && state.type !== 'customers') return { ...state };
      if (resAccount.role.isAgent || (resAccount.role.isAdmin && state.type === 'customers')) return { ...state };
      if (resAccount.role.isAdmin && !resAccount.role.isAgent && state.type === 'agents') return { ...state };
      if (resAccount.role.isAgent && !resAccount.role.isAdmin && state.type === 'admins') return { ...state };

      const insertedAccount = state.accounts.push(fromJS(resAccount));
      return {
        ...state,
        accounts: insertedAccount.sortBy((account) => account.get('fullname')),
      };
    },

    [SAVE_EDIT_ACCOUNT.SUCCESS]: (state, action) => {
      const resUser = action.response.user;
      const accountIndex = state.accounts.findIndex((u) => {
        return u.get('_id') === resUser._id;
      });

      const customer = !resUser.role.isAdmin && !resUser.role.isAgent;

      let accounts = null;
      if ((state.type === 'agents' || state.type === 'admins') && !customer)
        accounts = state.accounts.set(accountIndex, fromJS(resUser));
      else if ((state.type === 'agents' || state.type === 'admins') && customer)
        accounts = state.accounts.remove(accountIndex);
      else if (state.type === 'customers' && !customer) accounts = state.accounts.remove(accountIndex);
      else if (state.type === 'customers' && customer) accounts = state.accounts.set(accountIndex, fromJS(resUser));

      return {
        ...state,
        accounts,
      };
    },

    [DELETE_ACCOUNT.PENDING]: (state, action) => {
      const accountIndex = state.accounts.findIndex((u) => {
        return u.get('username') === action.payload.username;
      });
      return {
        ...state,
        accounts: state.accounts.setIn([accountIndex, 'loading'], true),
      };
    },

    [DELETE_ACCOUNT.SUCCESS]: (state, action) => {
      const isDisabled = action.response.disabled;
      const accountIndex = state.accounts.findIndex((u) => {
        return u.get('username') === action.payload.username;
      });
      let withDisabled;
      withDisabled = state.accounts.setIn([accountIndex, 'deleted'], isDisabled);
      withDisabled = withDisabled.setIn([accountIndex, 'loading'], false);
      if (!isDisabled) withDisabled = state.accounts.delete(accountIndex);
      return {
        ...state,
        accounts: withDisabled,
      };
    },

    [ENABLE_ACCOUNT.SUCCESS]: (state, action) => {
      const accountIndex = state.accounts.findIndex((u) => {
        return u.get('username') === action.payload.username;
      });
      return {
        ...state,
        accounts: state.accounts.setIn([accountIndex, 'deleted'], false),
      };
    },

    [UNLOAD_ACCOUNTS.SUCCESS]: (state) => {
      return {
        ...state,
        accounts: state.accounts.clear(),
      };
    },
  },
  initialState
);

export default reducer;
