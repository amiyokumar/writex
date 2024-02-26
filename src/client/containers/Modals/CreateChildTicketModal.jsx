import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { observer } from 'mobx-react';
import { makeObservable } from 'mobx';
import { createChildTicket, fetchTicketTypes } from 'actions/tickets';

import $ from 'jquery';
import helpers from 'lib/helpers';

import BaseModal from 'containers/Modals/BaseModal';
import SingleSelect from 'components/SingleSelect';

import Button from 'components/Button';

@observer
class CreateChildTicketModal extends React.Component {
  constructor(props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.props.fetchTicketTypes();
    helpers.UI.inputs();
    helpers.formvalidator();
  }

  componentDidUpdate() {}

  componentWillUnmount() {}
  onFormSubmit(e) {
    e.preventDefault();
    const $form = $(e.target);

    const data = {};
    const allowAgentUserTickets =
      this.props.viewdata.get('ticketSettings').get('allowAgentUserTickets') &&
      (this.props.shared.sessionUser.role.isAdmin || this.props.shared.sessionUser.role.isAgent);

    if (!$form.isValid(null, null, false)) return true;

    if (this.props.ticketID === e.target.ticketID.value) alert('Ticket ID must be unique!');

    if (allowAgentUserTickets) data.owner = this.ownerSelect.value;

    data.type = this.typeSelect.value;
    data.socketid = this.props.socket.io.engine.id;
    data.parentId = this.props.parentId;
    data.parentUid = this.props.parentUid;
    data.ticketID = e.target.ticketID.value;
    data.parentTicketID = this.props.parentTicketID;

    this.props.createChildTicket(data);
  }
  render() {
    const mappedTicketTypes = this.props.ticketTypes
      .toArray()
      .filter((type) => type.get('name') !== 'Sales')
      .map((type) => {
        return { text: type.get('name'), value: type.get('_id') };
      });

    return (
      <BaseModal {...this.props} options={{ bgclose: false }}>
        <form className={'uk-form-stacked'} onSubmit={(e) => this.onFormSubmit(e)}>
          <div className="uk-margin-medium-bottom">
            <label>Ticket ID</label>
            <input
              type="text"
              name={'ticketID'}
              className={'md-input'}
              defaultValue={this.props.ticketID}
              data-validation="length"
              data-validation-length={`min${6}`}
              data-validation-error-msg={`Please enter a valid ticket id. Ticket ID must contain at least ${6} characters.`}
            />

            <label className={'uk-form-label'}>Type</label>
            <SingleSelect
              showTextbox={false}
              items={mappedTicketTypes}
              defaultValue={'Dev'}
              ref={(i) => (this.typeSelect = i)}
            />
          </div>
          <div className="uk-modal-footer uk-text-right">
            <Button text={'Cancel'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Create'} style={'primary'} flat={true} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    );
  }
}

CreateChildTicketModal.propTypes = {
  shared: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired,
  viewdata: PropTypes.object.isRequired,
  ticketTypes: PropTypes.object.isRequired,
  createChildTicket: PropTypes.func.isRequired,
  fetchTicketTypes: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  shared: state.shared,
  socket: state.shared.socket,
  viewdata: state.common.viewdata,
  ticketTypes: state.ticketsState.types,
});

export default connect(mapStateToProps, {
  createChildTicket,
  fetchTicketTypes,
})(CreateChildTicketModal);
