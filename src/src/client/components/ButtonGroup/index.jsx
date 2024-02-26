import React from 'react';
import PropTypes from 'prop-types';

class ButtonGroup extends React.Component {
  render() {
    return (
      <div className={'md-btn-group mt-5' + (this.props.classNames ? ' ' + this.props.classNames : '')}>
        {this.props.children}
      </div>
    );
  }
}

ButtonGroup.propTypes = {
  classNames: PropTypes.string,
};

export default ButtonGroup;
