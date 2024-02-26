/*
   
 *  
 *  Copyright (c) 2014-2022. Trudesk, Inc (Chris Brame) All rights reserved.
 */

import { fromJS, Map, List } from 'immutable';
import { handleActions } from 'redux-actions';
import { sortBy, map } from 'lodash';
import {
  FETCH_CONVERSATIONS,
  FETCH_SINGLE_CONVERSATION,
  MESSAGES_SEND,
  MESSAGES_UI_RECEIVE,
  UNLOAD_SINGLE_CONVERSATION,
  UNLOAD_CONVERSATIONS,
  DELETE_CONVERSATION,
  SET_CURRENT_CONVERSATION,
} from 'actions/types';

const initialState = {
  loading: false,
  conversations: List([]),

  loadingSingleConversation: false,
  currentConversation: null,

  loadingChatWindowConversation: Map({}),
  chatWindowConversations: Map({}),
};

const reducer = handleActions(
  {
    [FETCH_CONVERSATIONS.PENDING]: (state) => {
      return {
        ...state,
        loading: true,
      };
    },

    [FETCH_CONVERSATIONS.SUCCESS]: (state, action) => {
      return {
        ...state,
        loading: false,
        conversations: fromJS(action.response.conversations),
      };
    },

    [DELETE_CONVERSATION.SUCCESS]: (state, action) => {
      if (!action.response.conversation) return { ...state };
      const conversation = action.response.conversation;
      const idx = state.conversations.findIndex((i) => i.get('_id').toString() === conversation._id.toString());
      if (idx === -1) return { ...state };

      return {
        ...state,
        conversations: state.conversations.delete(idx),
      };
    },

    [UNLOAD_CONVERSATIONS.SUCCESS]: (state) => {
      return {
        ...state,
        conversations: initialState.conversations,
      };
    },

    [FETCH_SINGLE_CONVERSATION.PENDING]: (state) => {
      return {
        ...state,
        loadingSingleConversation: true,
      };
    },

    [FETCH_SINGLE_CONVERSATION.SUCCESS]: (state, action) => {
      return {
        ...state,
        loadingSingleConversation: false,
        currentConversation: fromJS(action.response.conversation),
      };
    },

    [SET_CURRENT_CONVERSATION.SUCCESS]: (state, action) => {
      const conversation = action.payload.conversation;
      console.log(conversation);
      if (!conversation) return { ...state };

      return {
        ...state,
        loadingSingleConversation: false,
        currentConversation: fromJS(conversation),
      };
    },

    [UNLOAD_SINGLE_CONVERSATION.SUCCESS]: (state) => {
      return {
        ...state,
        currentConversation: null,
      };
    },

    [MESSAGES_SEND.SUCCESS]: (state, action) => {
      return { ...state };
    },

    [MESSAGES_UI_RECEIVE.SUCCESS]: (state, action) => {
      const message = fromJS(action.payload.message);
      const isOwner = action.payload.isOwner;
      let conversation = state.conversations.find(
        (c) => c.get('_id').toString() === message.get('conversation').toString()
      );
      const index = state.conversations.indexOf(conversation);

      if (index === -1) {
        return {
          ...state,
        };
      }

      conversation = conversation.set(
        'recentMessage',
        `${isOwner ? 'You' : message.get('owner').get('fullname')}: ${message.get('body')}`
      );

      conversation = conversation.set('updatedAt', message.get('createdAt'));

      if (
        !state.currentConversation ||
        state.currentConversation.get('_id').toString() !== message.get('conversation').toString()
      ) {
        return {
          ...state,
          conversations: state.conversations.set(index, conversation),
        };
      }

      const newMessageList = state.currentConversation.get('messages').push(message);

      return {
        ...state,
        conversations: state.conversations.set(index, conversation),
        currentConversation: state.currentConversation.set('messages', newMessageList),
      };
    },
  },
  initialState
);

export default reducer;
