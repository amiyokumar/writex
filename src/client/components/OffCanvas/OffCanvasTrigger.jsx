import React from 'react';
import PropTypes from 'prop-types';

class OffCanvasTrigger extends React.Component {
  render() {
    return <div data-uk-offcanvas={`{target: '#${this.props.target}', mode: 'slide'}`}>{this.props.children}</div>;
  }
}

OffCanvasTrigger.propTypes = {
  target: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default OffCanvasTrigger;
