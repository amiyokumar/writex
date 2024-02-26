/*
   
 *  
 *  Copyright (c) 2014-2019 Trudesk, Inc. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getTagsWithPage } from 'actions/tickets';
import { showModal, hideModal } from 'actions/common';

import BaseModal from 'containers/Modals/BaseModal';
import Button from 'components/Button';
import Log from '../../logger';
import axios from 'axios';
import $ from 'jquery';
import helpers from 'lib/helpers';

import { TICKETS_UI_TAGS_UPDATE } from 'serverSocket/socketEventConsts';

class AddTagsModal extends React.Component {
  componentDidMount() {
    this.props.getTagsWithPage({ limit: -1, page: 0 });
  }

  componentDidUpdate() {
    helpers.setupChosen();
    if (!$(this.select).val() && this.props.currentTags && this.props.currentTags.length > 0)
      $(this.select).val(this.props.currentTags);

    $(this.select).trigger('chosen:updated');
  }

  onCreateTagClicked(e) {
    e.preventDefault();
    this.props.hideModal();
    setTimeout(() => {
      this.props.showModal('CREATE_TAG');
    }, 300);
  }

  onSubmit(e) {
    e.preventDefault();
    let selectedTags = $(e.target.tags).val();
    if (!selectedTags) selectedTags = [];
    axios
      .put(`/api/v1/tickets/${this.props.ticketId}`, {
        tags: selectedTags,
      })
      .then(() => {
        this.props.socket.emit(TICKETS_UI_TAGS_UPDATE, { ticketId: this.props.ticketId });
        this.closeButton.click();
      })
      .catch((error) => {
        Log.error(error);
        helpers.UI.showSnackbar(error, true);
      });
  }

  onClearClicked() {
    axios
      .put(`/api/v1/tickets/${this.props.ticketId}`, {
        tags: [],
      })
      .then(() => {
        $(this.select).val('').trigger('chosen:updated');
        this.props.socket.emit(TICKETS_UI_TAGS_UPDATE, { ticketId: this.props.ticketId });
      })
      .catch((error) => {
        Log.error(error);
        helpers.UI.showSnackbar(error, true);
      });
  }

  render() {
    const mappedTags =
      this.props.tagsSettings.tags &&
      this.props.tagsSettings.tags
        .map((tag) => {
          return {
            text: tag.get('name'),
            value: tag.get('_id'),
          };
        })
        .toArray();

    return (
      <BaseModal options={{ bgclose: false }}>
        <div className={'uk-clearfix'}>
          <h5 style={{ fontWeight: 300 }}>Add Tags</h5>
          <div>
            <form className="nomargin" onSubmit={(e) => this.onSubmit(e)}>
              <div className="search-container">
                <select
                  name="tags"
                  id="tags"
                  className="chosen-select"
                  multiple
                  data-placeholder=" "
                  data-noresults="No Tags Found for "
                  ref={(r) => (this.select = r)}
                >
                  {mappedTags.map((tag) => (
                    <option key={tag.value} value={tag.value}>
                      {tag.text}
                    </option>
                  ))}
                </select>
                {this.props.sessionUser &&
                  ['admin', 'pm', 'tm', 'sales'].includes(this.props.sessionUser.role.normalized) && (
                    <button type="button" style={{ borderRadius: 0 }} onClick={(e) => this.onCreateTagClicked(e)}>
                      <i className="material-icons" style={{ marginRight: 0 }}>
                        add
                      </i>
                    </button>
                  )}
              </div>

              <div className="left" style={{ marginTop: 15 }}>
                <Button
                  type={'button'}
                  text={'Clear'}
                  small={true}
                  flat={true}
                  style={'danger'}
                  onClick={(e) => this.onClearClicked(e)}
                />
              </div>
              <div className="right" style={{ marginTop: 15 }}>
                <Button
                  type={'button'}
                  text={'Cancel'}
                  style={'secondary'}
                  small={true}
                  flat={true}
                  waves={true}
                  extraClass={'uk-modal-close'}
                  ref={(r) => (this.closeButton = r)}
                />
                <Button type={'submit'} text={'Save Tags'} style={'success'} small={true} waves={true} />
              </div>
            </form>
          </div>
        </div>
      </BaseModal>
    );
  }
}

AddTagsModal.propTypes = {
  ticketId: PropTypes.string.isRequired,
  currentTags: PropTypes.array,
  tagsSettings: PropTypes.object.isRequired,
  getTagsWithPage: PropTypes.func.isRequired,
  socket: PropTypes.object.isRequired,
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  sessionUser: PropTypes.object,
};

const mapStateToProps = (state) => ({
  tagsSettings: state.tagsSettings,
  socket: state.shared.socket,
  sessionUser: state.shared.sessionUser,
});

export default connect(mapStateToProps, { getTagsWithPage, showModal, hideModal })(AddTagsModal);
