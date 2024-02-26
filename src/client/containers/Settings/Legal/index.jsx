import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from 'components/Button';
import EasyMDE from 'components/EasyMDE';
import { updateSetting } from 'actions/settings';

import helpers from 'lib/helpers';
import SettingItem from 'components/Settings/SettingItem';

class LegalSettingsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      privacyPolicy: '',
    };
  }

  getSetting(name) {
    return this.props.settings.getIn(['settings', name, 'value'])
      ? this.props.settings.getIn(['settings', name, 'value'])
      : '';
  }

  onSavePrivacyPolicyClicked(e) {
    e.preventDefault();
    console.log(this.state.privacyPolicy);
    this.props
      .updateSetting({
        stateName: 'privacyPolicy',
        name: 'legal:privacypolicy',
        value: this.state.privacyPolicy,
        noSnackbar: true,
      })
      .then(() => {
        helpers.UI.showSnackbar('Privacy Policy Updated');
      });
  }

  render() {
    const { active } = this.props;
    return (
      <div className={!active ? 'hide' : ''}>
        <SettingItem title={'Privacy Policy'} subtitle={'Paste in HTML/Text of your privacy policy.'}>
          <div>
            <EasyMDE
              defaultValue={this.getSetting('privacyPolicy')}
              onChange={(v) => this.setState({ privacyPolicy: v })}
            />
          </div>
          <div className="uk-clearfix">
            <Button
              text={'Save'}
              extraClass={'uk-float-right'}
              flat={true}
              style={'success'}
              waves={true}
              onClick={(e) => this.onSavePrivacyPolicyClicked(e)}
            />
          </div>
        </SettingItem>
      </div>
    );
  }
}

LegalSettingsContainer.propTypes = {
  active: PropTypes.bool,
  settings: PropTypes.object.isRequired,
  updateSetting: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  settings: state.settings.settings,
});

export default connect(mapStateToProps, { updateSetting })(LegalSettingsContainer);
