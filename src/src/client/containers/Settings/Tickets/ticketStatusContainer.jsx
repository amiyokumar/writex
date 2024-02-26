/*
   
 *  
 *  Copyright (c) 2014-2023. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { observer } from 'mobx-react';
import { showModal, hideModal } from 'actions/common';
import SplitSettingsPanel from 'components/Settings/SplitSettingsPanel';
import Button from 'components/Button';

import $ from 'jquery';
import axios from 'axios';
import helpers from 'lib/helpers';
import TicketStatusBody from 'containers/Settings/Tickets/ticketStatusBody';

@observer
class TicketStatusContainer extends React.Component {
  onCreateStatusClicked(e) {
    this.props.showModal('CREATE_STATUS');
  }

  onStatusOrderChanged(e) {
    const children = $(e.target).children('li');
    const arr = [];
    for (let i = 0; i < children.length; i++) arr.push($(children[i]).attr('data-key'));

    axios
      .put('/api/v1/tickets/status/order', { order: arr })
      .then((res) => {})
      .catch((err) => {
        console.log(err);
        helpers.UI.showSnackbar(err.message || err.response?.statusText, true);
      });
  }

  render() {
    return (
      <div>
        <SplitSettingsPanel
          title={'Ticket Status'}
          subtitle={'Ticket status sets the state of a ticket. (Active, Pending, Resolved, etc.)'}
          rightComponent={
            <Button
              text={'Create'}
              style={'success'}
              flat={true}
              waves={true}
              onClick={(e) => this.onCreateStatusClicked(e)}
            />
          }
          menuItems={
            this.props.statuses
              ? this.props.statuses.map((status) => {
                  return {
                    key: status.get('_id'),
                    title: status.get('name'),
                    content: (
                      <div>
                        <h3 style={{ display: 'inline-block' }}>{status.get('name')}</h3>
                        <span
                          style={{
                            display: 'inline-block',
                            marginLeft: 5,
                            width: 10,
                            height: 10,
                            background: status.get('htmlColor'),
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    ),
                    bodyComponent: <TicketStatusBody status={status} />,
                  };
                })
              : []
          }
          menuDraggable={true}
          menuOnDrag={(e) => this.onStatusOrderChanged(e)}
        ></SplitSettingsPanel>
      </div>
    );
  }
}

TicketStatusContainer.propTypes = {
  statuses: PropTypes.arrayOf(PropTypes.object),
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { showModal, hideModal })(TicketStatusContainer);
