import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import { createStatus } from 'actions/tickets';
import BaseModal from './BaseModal';
import Button from 'components/Button';
import ColorSelector from 'components/ColorSelector';

import $ from 'jquery';
import helpers from 'lib/helpers';
import EnableSwitch from 'components/Settings/EnableSwitch';

@observer
class CreateStatusModal extends React.Component {
  @observable name = '';
  @observable htmlColor = '#29B995';
  @observable slatimer = true;
  @observable isResolved = false;

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    helpers.UI.inputs();
    helpers.formvalidator();
  }

  onCreateStatusSubmit(e) {
    e.preventDefault();
    const $form = $(e.target);
    if (!$form.isValid(null, null, false)) return true;

    //  Form is valid... Submit..
    this.props.createStatus({
      name: this.name,
      htmlColor: this.htmlColor,
      slatimer: this.slatimer,
      isResolved: this.isResolved,
    });
  }

  render() {
    return (
      <BaseModal {...this.props} large={true}>
        <form className={'uk-form-stacked'} onSubmit={(e) => this.onCreateStatusSubmit(e)}>
          <div className="uk-margin-medium-bottom uk-clearfix">
            <h2>Create Status</h2>
          </div>

          <div>
            <div className="uk-clearfix">
              <div className="z-box uk-grid uk-grid-collpase uk-clearfix">
                <div className="uk-width-1-4">
                  <label>Status Name</label>
                  <input
                    type="text"
                    className={'md-input'}
                    value={this.name}
                    onChange={(e) => (this.name = e.target.value)}
                    data-validation="length"
                    data-validation-length="min3"
                    data-validation-error-msg="Invalid name (3+ characters)"
                  />
                </div>

                <div className="uk-width-1-4">
                  <ColorSelector
                    hideRevert={true}
                    defaultColor={'#29B995'}
                    validationEnabled={true}
                    onChange={(e) => (this.htmlColor = e.target.value)}
                  />
                </div>
                <div className={'uk-width-1-4'}>
                  <div className={'uk-float-left'}>
                    <EnableSwitch
                      stateName={'slatimer'}
                      label={'SLA'}
                      checked={this.slatimer}
                      onChange={(e) => (this.slatimer = e.target.checked)}
                    />
                  </div>
                  <div className={'uk-float-left'}>
                    <EnableSwitch
                      stateName={'isResolved'}
                      label={'isResolved'}
                      checked={this.isResolved}
                      onChange={(e) => (this.isResolved = e.target.checked)}
                    />
                  </div>
                </div>
              </div>
              <div className="uk-modal-footer uk-text-right">
                <Button text={'Cancel'} type={'button'} extraClass={'uk-modal-close'} flat={true} waves={true} />
                <Button text={'Create'} type={'submit'} flat={true} waves={true} style={'success'} />
              </div>
            </div>
          </div>
        </form>
      </BaseModal>
    );
  }
}

CreateStatusModal.propTypes = {
  createStatus: PropTypes.func.isRequired,
};

export default connect(null, { createStatus })(CreateStatusModal);
