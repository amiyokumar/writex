import React from 'react';
import PropTypes from 'prop-types';

class ZoneBox extends React.Component {
  render() {
    const { extraClass } = this.props;
    return <div className={'z-box uk-clearfix ' + (extraClass ? extraClass : '')}>{this.props.children}</div>;
  }
}

ZoneBox.propTypes = {
  extraClass: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default ZoneBox;
