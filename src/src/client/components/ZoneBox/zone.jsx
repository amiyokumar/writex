import React from 'react';
import PropTypes from 'prop-types';

class Zone extends React.Component {
  render() {
    const { extraClass } = this.props;
    return <div className={'zone uk-clearfix ' + (extraClass ? extraClass : '')}>{this.props.children}</div>;
  }
}

Zone.propTypes = {
  extraClass: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default Zone;
