/*
   
 *  
 *  Copyright (c) 2014-2019 Trudesk, Inc. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { observer } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
import { connect } from 'react-redux';

import { TICKETS_STATUS_SET, TICKETS_UI_STATUS_UPDATE } from 'serverSocket/socketEventConsts';
import { fetchTicketStatus } from 'actions/tickets';
import axios from 'axios';
import Log from '../../logger';

@observer
class StatusSelector extends React.Component {
  @observable status = null;

  constructor(props) {
    super(props);
    makeObservable(this);

    this.status = this.props.status;

    this.onDocumentClick = this.onDocumentClick.bind(this);
    this.onUpdateTicketStatus = this.onUpdateTicketStatus.bind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this.onDocumentClick);

    this.props.socket.on(TICKETS_UI_STATUS_UPDATE, this.onUpdateTicketStatus);
    this.props.fetchTicketStatus();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.status !== this.props.status) this.status = this.props.status;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onDocumentClick);
    this.props.socket.off(TICKETS_UI_STATUS_UPDATE, this.onUpdateTicketStatus);
  }

  onDocumentClick(e) {
    if (!this.selectorButton.contains(e.target) && this.dropMenu.classList.contains('shown')) this.forceClose();
  }

  onUpdateTicketStatus(data) {
    if (this.props.ticketId === data.tid) {
      this.status = data.status;
      if (this.props.onStatusChange) this.props.onStatusChange(this.status);
    }
  }

  toggleDropMenu(e) {
    e.stopPropagation();
    if (!this.props.hasPerm) return;
    const hasHide = this.dropMenu.classList.contains('hide');
    const hasShown = this.dropMenu.classList.contains('shown');
    hasHide ? this.dropMenu.classList.remove('hide') : this.dropMenu.classList.add('hide');
    hasShown ? this.dropMenu.classList.remove('shown') : this.dropMenu.classList.add('shown');
  }

  forceClose() {
    this.dropMenu.classList.remove('shown');
    this.dropMenu.classList.add('hide');
  }

  changeStatus(statusId, status) {
    if (!this.props.hasPerm) return;

    if (this.props.ticketType === 'Dev' && status === 'Closed') {
      axios
        .get(`/api/v2/tickets/closedev/${this.props.parentId}`)
        .then((res) => {
          if (res.data.canClose)
            this.props.socket.emit(TICKETS_STATUS_SET, { _id: this.props.ticketId, value: statusId });
          else
            window.alert(
              'The ticket cannot be closed. Make sure the dependent tickets-QA and Accounts are closed first!'
            );
        })
        .catch((error) => {
          Log.error(error);
        });
    } else if (this.props.ticketType === 'Sales' && status === 'Closed') {
      axios
        .get(`/api/v2/tickets/closeparent/${this.props.ticketId}`)
        .then((res) => {
          if (res.data.canClose)
            this.props.socket.emit(TICKETS_STATUS_SET, { _id: this.props.ticketId, value: statusId });
          else
            window.alert(
              'The ticket cannot be closed. Make sure the dependent tickets-Dev, QA and Accounts are closed first!'
            );
        })
        .catch((error) => {
          Log.error(error);
        });
    } else {
      this.props.socket.emit(TICKETS_STATUS_SET, { _id: this.props.ticketId, value: statusId });
    }
    this.forceClose();
  }

  render() {
    const currentStatus = this.props.ticketStatuses
      ? this.props.ticketStatuses.find((s) => s.get('_id') === this.status)
      : null;

    return (
      <div className="floating-ticket-status">
        <div
          title="Change Status"
          className={clsx(`ticket-status`, this.props.hasPerm && `cursor-pointer`)}
          style={{ color: 'white', background: currentStatus != null ? currentStatus.get('htmlColor') : '#000000' }}
          onClick={(e) => this.toggleDropMenu(e)}
          ref={(r) => (this.selectorButton = r)}
        >
          <span>{currentStatus != null ? currentStatus.get('name') : 'Unknown'}</span>
        </div>

        {this.props.hasPerm && (
          <span className="drop-icon material-icons" style={{ left: 'auto', right: 22, bottom: -18 }}>
            keyboard_arrow_down
          </span>
        )}

        <div
          id={'statusSelect'}
          ref={(r) => (this.dropMenu = r)}
          className="hide"
          style={{ height: 25 * this.props.ticketStatuses.size + 25 }}
        >
          <ul>
            {this.props.ticketStatuses.map(
              (s) =>
                s && (
                  <li
                    key={s.get('_id')}
                    className="ticket-status"
                    onClick={() => this.changeStatus(s.get('_id'), s.get('name'))}
                    style={{ color: 'white', background: s.get('htmlColor') }}
                  >
                    <span>{s.get('name')}</span>
                  </li>
                )
            )}
          </ul>
        </div>
      </div>
    );
  }
}

StatusSelector.propTypes = {
  ticketId: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  ticketType: PropTypes.string.isRequired,
  parentId: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func,
  hasPerm: PropTypes.bool.isRequired,
  socket: PropTypes.object.isRequired,
  fetchTicketStatus: PropTypes.func.isRequired,
  ticketStatuses: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  ticketStatuses: state.ticketsState.ticketStatuses,
});

StatusSelector.defaultProps = {
  hasPerm: false,
};

export default connect(mapStateToProps, {
  fetchTicketStatus,
})(StatusSelector);
