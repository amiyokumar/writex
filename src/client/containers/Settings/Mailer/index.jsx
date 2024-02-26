import React from 'react';
import PropTypes from 'prop-types';
import MailerSettings_Mailer from './mailer';
import Mailer_MailerCheck from './mailerCheck';
import MailerSettingsTemplates from 'containers/Settings/Mailer/mailerSettingsTemplates';

class MailerSettingsContainer extends React.Component {
  render() {
    const { active } = this.props;
    return (
      <div className={active ? 'active' : 'hide'}>
        <MailerSettingsTemplates />
        <MailerSettings_Mailer />
        <Mailer_MailerCheck />
      </div>
    );
  }
}

MailerSettingsContainer.propTypes = {
  active: PropTypes.bool.isRequired,
};

export default MailerSettingsContainer;
