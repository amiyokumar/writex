import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BaseModal from './BaseModal';
import SingleSelect from 'components/SingleSelect';
import Button from 'components/Button';

import { deletePriority } from 'actions/tickets';

import helpers from 'lib/helpers';

class DeletePriorityModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPriority: '',
    };
  }

  onSubmit(e) {
    e.preventDefault();
    if (!this.state.selectedPriority) {
      helpers.UI.showSnackbar('Unable to get new priority. Aborting...', true);
      return true;
    }

    this.props.deletePriority({ id: this.props.priority.get('_id'), newPriority: this.state.selectedPriority });
  }

  getPriorities() {
    return this.props.settings && this.props.settings.get('priorities')
      ? this.props.settings.get('priorities').toArray()
      : [];
  }

  onSelectChanged(e) {
    this.setState({
      selectedPriority: e.target.value,
    });
  }

  render() {
    const { priority } = this.props;
    const mappedPriorities = this.getPriorities()
      .filter((obj) => {
        return priority.get('name') !== obj.get('name');
      })
      .map((p) => {
        return { text: p.get('name'), value: p.get('_id') };
      });
    return (
      <BaseModal>
        <div>
          <form onSubmit={(e) => this.onSubmit(e)}>
            <div className="uk-margin-medium-bottom uk-clearfix">
              <h2>Remove Priority</h2>
              <span>Please select the priority you wish to reassign tickets to in order to delete this priority</span>
              <hr style={{ margin: '10px 0' }} />
            </div>
            <div className="uk-margin-medium-bottom uk-clearfix">
              <div className="uk-float-left" style={{ width: '100%' }}>
                <label className={'uk-form-label'}>Priority</label>
                <SingleSelect
                  items={mappedPriorities}
                  showTextbox={false}
                  width={'100%'}
                  value={this.state.selectedPriority}
                  onSelectChange={(e) => this.onSelectChanged(e)}
                />
              </div>
            </div>
            <div className="uk-margin-medium-bottom uk-clearfix">
              <span className="uk-text-danger">
                WARNING: This will change all tickets with a priority of: <strong>{priority.get('name')}</strong> to the
                selected priority above.
              </span>
            </div>
            <div className="uk-modal-footer uk-text-right">
              <Button type={'button'} flat={true} waves={true} text={'Cancel'} extraClass={'uk-modal-close'} />
              <Button type={'submit'} flat={true} waves={true} text={'Delete'} style={'danger'} />
            </div>
          </form>
        </div>
      </BaseModal>
    );
  }
}

DeletePriorityModal.propTypes = {
  priority: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  deletePriority: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  settings: state.settings.settings,
});

export default connect(mapStateToProps, { deletePriority })(DeletePriorityModal);
