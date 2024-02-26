import React from 'react';
import PropTypes from 'prop-types';

class DropdownHeader extends React.Component {
  render() {
    return <li className={'uk-nav-header'}>{this.props.text}</li>;
  }
}

DropdownHeader.propTypes = {
  text: PropTypes.string.isRequired,
};

export default DropdownHeader;
