import React from 'react';
import PropTypes from 'prop-types';
import { VelocityComponent } from 'velocity-react';

class SplitSettingsPanelBody extends React.Component {
  render() {
    const { active } = this.props;
    return (
      <VelocityComponent animation={{ opacity: active ? 1 : 0 }} duration={750}>
        <div className={active ? '' : 'hide'}>{this.props.component}</div>
      </VelocityComponent>
    );
  }
}

SplitSettingsPanelBody.propTypes = {
  active: PropTypes.bool.isRequired,
  component: PropTypes.node.isRequired,
};

export default SplitSettingsPanelBody;
