import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import moment from 'moment-timezone';

import { MESSAGES_UPDATE_UI_CONVERSATION_NOTIFICATIONS } from 'serverSocket/socketEventConsts';
import PDropDown from 'components/PDropdown';

import helpers from 'lib/helpers';
import 'history';

@observer
class ConversationsDropdownPartial extends React.Component {
  @observable conversations = [];

  constructor(props) {
    super(props);
    makeObservable(this);

    this.onUpdateConversationsNotifications = this.onUpdateConversationsNotifications.bind(this);
  }

  componentDidMount() {
    this.props.socket.on(MESSAGES_UPDATE_UI_CONVERSATION_NOTIFICATIONS, this.onUpdateConversationsNotifications);
  }

  componentWillUnmount() {
    this.props.socket.off(MESSAGES_UPDATE_UI_CONVERSATION_NOTIFICATIONS, this.onUpdateConversationsNotifications);
  }

  onUpdateConversationsNotifications(data) {
    helpers.setupScrollers();
    if (!helpers.arrayIsEqual(this.conversations, data.conversations)) this.conversations = data.conversations;
  }

  onConversationClicked(e, id) {
    e.preventDefault();

    History.pushState(null, null, `/messages/${id}`);
  }

  render() {
    const { timezone, shortDateFormat, forwardedRef } = this.props;

    return (
      <PDropDown
        ref={forwardedRef}
        id={'conversations'}
        title={'Conversations'}
        titleHref={'/messages'}
        topOffset={-4}
        leftOffset={4}
        onShow={() => {
          this.props.socket.emit(MESSAGES_UPDATE_UI_CONVERSATION_NOTIFICATIONS);
        }}
        rightComponent={
          <a href={'/messages/startconversation'} className={'hoverUnderline'}>
            Start Conversation
          </a>
        }
        footerComponent={
          <div className={'uk-text-center' + (this.conversations.length < 1 ? ' hide' : '')}>
            <a
              className={'no-ajaxy hoverUnderline'}
              onClick={() => {
                History.pushState(null, null, '/messages');
              }}
            >
              View All Conversations
            </a>
          </div>
        }
      >
        <div className={'items scrollable close-on-click'}>
          <ul>
            {this.conversations.map((conversation) => {
              const profilePic = conversation.partner.image || 'defaultProfile.jpg';
              const formattedTimestamp = moment.utc(conversation.updatedAt).tz(timezone).format('YYYY-MM-DDThh:mm');
              const formattedDate = moment.utc(conversation.updatedAt).tz(timezone).format(shortDateFormat);
              return (
                <li key={conversation._id}>
                  <a
                    className="no-ajaxy messageNotification uk-position-relative"
                    onClick={(e) => this.onConversationClicked(e, conversation._id)}
                  >
                    <div className="uk-clearfix">
                      <div className="profilePic uk-float-left">
                        <img src={`/uploads/users/${profilePic}`} alt="Profile Picture" />
                      </div>
                      <div className="messageAuthor">
                        <strong>{conversation.partner.fullname}</strong>
                      </div>
                      <div className="messageSnippet">
                        <span>{conversation.recentMessage}</span>
                      </div>
                      <div className="messageDate" style={{ position: 'absolute', top: '10px', right: '15px' }}>
                        <time dateTime={formattedTimestamp}>{formattedDate}</time>
                      </div>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </PDropDown>
    );
  }
}

ConversationsDropdownPartial.propTypes = {
  timezone: PropTypes.string.isRequired,
  shortDateFormat: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
  forwardedRef: PropTypes.any.isRequired,
};

export default ConversationsDropdownPartial;
