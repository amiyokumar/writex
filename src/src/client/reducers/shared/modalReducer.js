import { handleActions } from 'redux-actions';
import { SHOW_MODAL, HIDE_MODAL, CLEAR_MODAL } from 'actions/types';

import UIKit from 'uikit';

const initialState = {
  modalType: null,
  modalProps: {},
};

const ModalReducer = handleActions(
  {
    [SHOW_MODAL]: (state, action) => ({
      modalType: action.payload.modalType,
      modalProps: action.payload.modalProps,
    }),

    [HIDE_MODAL]: (state, action) => {
      const modal = document.getElementById('uk-modal');
      if (modal) {
        const modalTag = modal.getAttribute('data-modal-tag');
        if (modalTag === action.payload) UIKit.modal(modal).hide();
        else if (!modalTag) UIKit.modal(modal).hide();
      }
      return state;
    },

    [CLEAR_MODAL]: () => ({
      ...initialState,
    }),
  },
  initialState
);

export default ModalReducer;
