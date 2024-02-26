import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import axios from 'axios';
import Log from '../../logger';

import { NOTIFICATIONS_MARK_READ } from 'serverSocket/socketEventConsts';

import { hideModal } from 'actions/common';

import BaseModal from 'containers/Modals/BaseModal';
import Button from 'components/Button';

import helpers from 'lib/helpers';

@observer
class ViewAllNotificationsModal extends React.Component {
  @observable notifications = [];

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    helpers.hideAllpDropDowns();
    axios
      .get('/api/v1/users/notifications')
      .then((res) => {
        this.notifications = res.data.notifications;
      })
      .catch((err) => {
        helpers.UI.showSnackbar(`Error: ${err.response}`, true);
        Log.error(err.response);
      });
  }

  onNotificationClick(e, notification) {
    e.preventDefault();
    if (!notification || !notification.data || !notification.data.ticket || !notification.data.ticket.uid) return false;

    this.props.hideModal();
    this.props.socket.emit(NOTIFICATIONS_MARK_READ, notification._id);
    History.pushState(null, null, `/tickets/${notification.data.ticket.uid}`);
  }

  render() {
    return (
      <BaseModal large={true}>
        <div className="uk-modal-header">
          <h2>Notifications</h2>
        </div>
        <div className="uk-modal-content" style={{ height: '400px', overflow: 'auto' }}>
          <table className="notificationsTable">
            <thead>
              <tr>
                <th className={'type'}>Type</th>
                <th className={'title'}>Title</th>
                <th className={'date'}>Date</th>
              </tr>
            </thead>
            <tbody>
              {this.notifications.map((notification) => {
                const formattedDate = helpers.formatDate(
                  notification.created,
                  helpers.getShortDateFormat() + ' ' + helpers.getTimeFormat()
                );
                return (
                  <tr
                    key={notification._id}
                    className={'notification-row'}
                    onClick={(e) => this.onNotificationClick(e, notification)}
                  >
                    <td className={'type'}>
                      <i className="fa fa-2x fa-check" />
                    </td>
                    <td className={'title'}>
                      <p>{notification.title}</p>
                      <div className={'body'}>{notification.message}</div>
                    </td>
                    <td className={'date'}>
                      <time dateTime={helpers.formatDate(notification.created, 'YYY-MM-DDThh:mm')}>
                        {formattedDate}
                      </time>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="uk-modal-footer uk-text-right">
          <Button text={'Close'} flat={true} waves={true} onClick={() => this.props.hideModal()} />
        </div>
      </BaseModal>
    );
  }
}

ViewAllNotificationsModal.propTypes = {
  hideModal: PropTypes.func.isRequired,
  socket: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  socket: state.shared.socket,
});

export default connect(mapStateToProps, { hideModal })(ViewAllNotificationsModal);
